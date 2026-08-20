"use server"

import { revalidatePath } from "next/cache"

import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/helpers"
import { validateAndIncrementDailyUsage } from "@/lib/actions/billing"
import { getAuthenticatedSupabase } from "@/lib/auth/session"
import { detectPlatformFromUrl } from "@/lib/browserbase/detector"
import { inngest } from "@/lib/inngest/client"
import type { ApplyMode, JobApplication } from "@/lib/supabase/database.types"

export async function startJobApplication(input: {
  jobId?: string | null
  jobUrl: string
  jobTitle: string
  company?: string | null
  applyMode: ApplyMode
}): Promise<ActionResult<JobApplication>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const platformInfo = detectPlatformFromUrl(input.jobUrl)

    if (input.applyMode === "manual") {
      // Manual apply flow: insert application as APPLIED and update job
      const { data, error } = await supabase
        .from("job_applications")
        .insert({
          user_id: userId,
          job_id: input.jobId || null,
          job_url: input.jobUrl,
          job_title: input.jobTitle,
          company: input.company || null,
          platform: platformInfo.platform,
          apply_mode: "manual",
          status: "APPLIED",
          applied_at: new Date().toISOString(),
        })
        .select("*")
        .single()

      if (error || !data) throw error || new Error("Failed to record manual application.")

      if (input.jobId) {
        await supabase
          .from("jobs")
          .update({ applied_status: true })
          .eq("id", input.jobId)
          .eq("user_id", userId)
      }

      revalidatePath("/dashboard/jobs")
      revalidatePath("/dashboard/application-status")
      return actionSuccess(data)
    }

    // Auto apply flow: check subscription & daily usage limits
    const usageCheck = await validateAndIncrementDailyUsage(userId)
    if (!usageCheck.allowed) {
      return actionError(
        usageCheck.errorMessage ||
          "Daily AI application limit reached. Upgrade your plan to apply to more jobs today."
      )
    }

    // Auto apply flow: create record and dispatch Inngest event
    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: userId,
        job_id: input.jobId || null,
        job_url: input.jobUrl,
        job_title: input.jobTitle,
        company: input.company || null,
        platform: platformInfo.platform,
        apply_mode: "auto",
        status: "PENDING",
      })
      .select("*")
      .single()

    if (error || !data) throw error || new Error("Failed to initialize automated application.")

    // Send Inngest background event
    await inngest.send({
      name: "job/application.detect-fields",
      data: {
        applicationId: data.id,
        userId,
        jobUrl: input.jobUrl,
        jobId: input.jobId,
      },
    })

    revalidatePath("/dashboard/jobs")
    revalidatePath("/dashboard/application-status")
    revalidatePath("/dashboard/billing")
    return actionSuccess(data)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to start job application."
    )
  }
}

export async function getApplicationStatus(
  applicationId: string
): Promise<ActionResult<JobApplication>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("user_id", userId)
      .single()

    if (error || !data) throw error || new Error("Application not found.")

    return actionSuccess(data)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not fetch application status."
    )
  }
}

export async function resumeApplicationAfterProfileUpdate(
  applicationId: string
): Promise<ActionResult<JobApplication>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("user_id", userId)
      .single()

    if (error || !data) throw error || new Error("Application not found.")

    // Reset status to PENDING and trigger detection/matching step again
    const { data: updated, error: updateError } = await supabase
      .from("job_applications")
      .update({
        status: "PENDING",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select("*")
      .single()

    if (updateError || !updated) throw updateError || new Error("Could not update application.")

    await inngest.send({
      name: "job/application.detect-fields",
      data: {
        applicationId,
        userId,
        jobUrl: data.job_url,
        jobId: data.job_id,
      },
    })

    revalidatePath("/dashboard/jobs")
    revalidatePath("/dashboard/application-status")
    revalidatePath("/dashboard/profile")
    return actionSuccess(updated)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to resume application."
    )
  }
}

export async function getUserApplications(): Promise<ActionResult<JobApplication[]>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return actionSuccess(data || [])
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to fetch user applications."
    )
  }
}
