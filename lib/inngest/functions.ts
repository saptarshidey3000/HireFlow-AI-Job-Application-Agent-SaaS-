import { inngest } from "@/lib/inngest/client"
import { executeAutoApplicationSubmission } from "@/lib/browserbase/autofill"
import { matchProfileToFormFields } from "@/lib/browserbase/field-matcher"
import { detectJobApplicationFields } from "@/lib/browserbase/stagehand"
import type { AutofillData } from "@/lib/browserbase/types"
import { createAdminClient } from "@/lib/supabase/admin"
import type { FullProfile } from "@/lib/supabase/database.types"

/**
 * Step 1 Inngest Function: Detect Form Fields via Browserbase + Stagehand
 * Concurrency is limited to 1 task per user to avoid browser session conflicts and rate limits.
 */
export const detectJobFieldsFunction = inngest.createFunction(
  {
    id: "detect-job-fields",
    name: "Detect Job Application Form Fields",
    triggers: [{ event: "job/application.detect-fields" }],
    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },
  },
  async ({ event, step }) => {
    const { applicationId, userId, jobUrl } = event.data as {
      applicationId: string
      userId: string
      jobUrl: string
      jobId?: string | null
    }
    const supabase = createAdminClient()

    // 1. Mark status as DETECTING_FIELDS
    await step.run("set-detecting-status", async () => {
      await supabase
        .from("job_applications")
        .update({
          status: "DETECTING_FIELDS",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
    })

    // 2. Run Stagehand field detection
    const detectionResult = await step.run("detect-form-fields", async () => {
      return await detectJobApplicationFields(jobUrl)
    })

    // 3. Fetch user's profile and active resume
    const { fullProfile, activeResume } = await step.run("fetch-user-profile", async () => {
      const [
        profileRes,
        skillsRes,
        experiencesRes,
        educationRes,
        projectsRes,
        certificationsRes,
        linksRes,
        resumeRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("profile_skills").select("*").eq("user_id", userId),
        supabase.from("profile_work_experiences").select("*").eq("user_id", userId),
        supabase.from("profile_education").select("*").eq("user_id", userId),
        supabase.from("profile_projects").select("*").eq("user_id", userId),
        supabase.from("profile_certifications").select("*").eq("user_id", userId),
        supabase.from("profile_links").select("*").eq("user_id", userId),
        supabase
          .from("resumes")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .order("uploaded_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      const full: FullProfile = {
        profile: profileRes.data || {
          id: userId,
          email: null,
          full_name: null,
          avatar_url: null,
          onboarding_completed: false,
          phone: null,
          location: null,
          professional_summary: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        skills: skillsRes.data || [],
        workExperiences: experiencesRes.data || [],
        education: educationRes.data || [],
        projects: projectsRes.data || [],
        certifications: certificationsRes.data || [],
        links: linksRes.data || [],
      }

      return {
        fullProfile: full,
        activeResume: resumeRes.data || null,
      }
    })

    // 4. Compare detected fields with profile
    const matchResult = await step.run("match-fields-with-profile", async () => {
      return matchProfileToFormFields(detectionResult.fields, fullProfile, activeResume)
    })

    // 5. Update application with detected fields and missing info
    const nextStatus = matchResult.isComplete ? "READY_TO_SUBMIT" : "MISSING_INFO"

    await step.run("update-application-state", async () => {
      await supabase
        .from("job_applications")
        .update({
          platform: detectionResult.platform,
          status: nextStatus,
          detected_fields: detectionResult.fields,
          missing_fields: matchResult.missingFields,
          form_data: matchResult.mappedValues,
          browserbase_session_id: detectionResult.sessionId || null,
          browserbase_session_url: detectionResult.sessionUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)
    })

    // 6. If all required info is present, trigger automatic submission
    if (matchResult.isComplete) {
      await step.sendEvent("trigger-submission", {
        name: "job/application.submit",
        data: {
          applicationId,
          userId,
        },
      })
    }

    return {
      success: true,
      status: nextStatus,
      missingFields: matchResult.missingFields,
      fieldsCount: detectionResult.fields.length,
    }
  }
)

/**
 * Step 2 Inngest Function: Submit Job Application via Browserbase + Stagehand
 * Concurrency is limited to 1 task per user for rate-limit and single-job queue safety.
 */
export const submitJobApplicationFunction = inngest.createFunction(
  {
    id: "submit-job-application",
    name: "Submit Job Application Form",
    triggers: [{ event: "job/application.submit" }],
    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },
  },
  async ({ event, step }) => {
    const { applicationId, userId } = event.data as {
      applicationId: string
      userId: string
    }
    const supabase = createAdminClient()

    // 1. Mark status as SUBMITTING
    const appData = await step.run("set-submitting-status", async () => {
      const { data: application } = await supabase
        .from("job_applications")
        .select("*")
        .eq("id", applicationId)
        .single()

      if (!application) throw new Error("Application not found.")

      await supabase
        .from("job_applications")
        .update({
          status: "SUBMITTING",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)

      return application
    })

    // 2. Fetch full profile and download active resume buffer
    const autofillData: AutofillData = await step.run("prepare-autofill-payload", async () => {
      const [
        profileRes,
        linksRes,
        experiencesRes,
        educationRes,
        skillsRes,
        resumeRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("profile_links").select("*").eq("user_id", userId),
        supabase.from("profile_work_experiences").select("*").eq("user_id", userId),
        supabase.from("profile_education").select("*").eq("user_id", userId),
        supabase.from("profile_skills").select("*").eq("user_id", userId),
        supabase
          .from("resumes")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .order("uploaded_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      const profile = profileRes.data
      const links = linksRes.data || []
      const activeResume = resumeRes.data

      let resumeBase64: string | undefined
      let resumeFileName: string | undefined

      if (activeResume?.storage_path) {
        resumeFileName = activeResume.file_name || "resume.pdf"
        const { data: fileData } = await supabase.storage
          .from("resumes")
          .download(activeResume.storage_path)

        if (fileData) {
          const arrayBuffer = await fileData.arrayBuffer()
          resumeBase64 = Buffer.from(arrayBuffer).toString("base64")
        }
      }

      const linkedinLink = links.find(
        (l) => l.type === "linkedin" || l.url.toLowerCase().includes("linkedin.com")
      )?.url

      const githubLink = links.find(
        (l) => l.type === "github" || l.url.toLowerCase().includes("github.com")
      )?.url

      const portfolioLink = links.find(
        (l) => l.type === "portfolio" || l.type === "other"
      )?.url

      return {
        fullName: profile?.full_name || undefined,
        email: profile?.email || undefined,
        phone: profile?.phone || undefined,
        location: profile?.location || undefined,
        summary: profile?.professional_summary || undefined,
        linkedinUrl: linkedinLink,
        githubUrl: githubLink,
        portfolioUrl: portfolioLink,
        resumeBase64,
        resumeFileName,
        workExperiences:
          experiencesRes.data?.map((w) => ({
            company: w.company,
            title: w.title,
            startDate: w.start_date,
            endDate: w.end_date,
            isCurrent: Boolean(w.is_current),
            responsibilities: w.responsibilities || [],
          })) || [],
        education:
          educationRes.data?.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.field_of_study,
            startDate: e.start_date,
            endDate: e.end_date,
          })) || [],
        skills: skillsRes.data?.map((s) => s.name) || [],
      }
    })

    // 3. Execute Browserbase + Stagehand auto application
    const submissionResult = await step.run("execute-submission", async () => {
      return await executeAutoApplicationSubmission(appData.job_url, autofillData)
    })

    // 4. Update final application state in DB
    await step.run("finalize-application-state", async () => {
      if (submissionResult.success) {
        await supabase
          .from("job_applications")
          .update({
            status: "APPLIED",
            applied_at: new Date().toISOString(),
            browserbase_session_id: submissionResult.sessionId || null,
            browserbase_session_url: submissionResult.sessionUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", applicationId)

        // Update jobs table applied_status if linked
        if (appData.job_id) {
          await supabase
            .from("jobs")
            .update({ applied_status: true })
            .eq("id", appData.job_id)
        }
      } else {
        await supabase
          .from("job_applications")
          .update({
            status: "FAILED",
            error_message: submissionResult.error || "Submission failed during execution.",
            browserbase_session_id: submissionResult.sessionId || null,
            browserbase_session_url: submissionResult.sessionUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", applicationId)
      }
    })

    return submissionResult
  }
)
