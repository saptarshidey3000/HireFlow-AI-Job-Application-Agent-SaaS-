import type { ParsedResume } from "@/lib/resume-parser/types"

type SupabaseClient = Awaited<
  ReturnType<typeof import("@/lib/supabase/server").createClient>
>

export async function saveParsedProfile(
  supabase: SupabaseClient,
  userId: string,
  parsed: ParsedResume
) {
  const { personalInfo, professionalSummary } = parsed

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: personalInfo.fullName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      location: personalInfo.location,
      professional_summary: professionalSummary,
      onboarding_completed: true,
    })
    .eq("id", userId)

  if (profileError) throw profileError

  await Promise.all([
    supabase.from("profile_skills").delete().eq("user_id", userId),
    supabase.from("profile_work_experiences").delete().eq("user_id", userId),
    supabase.from("profile_education").delete().eq("user_id", userId),
    supabase.from("profile_projects").delete().eq("user_id", userId),
    supabase.from("profile_certifications").delete().eq("user_id", userId),
    supabase.from("profile_links").delete().eq("user_id", userId),
  ])

  if (parsed.skills.length > 0) {
    const { error } = await supabase.from("profile_skills").insert(
      parsed.skills.map((name, index) => ({
        user_id: userId,
        name,
        sort_order: index,
      }))
    )
    if (error) throw error
  }

  if (parsed.workExperiences.length > 0) {
    const { error } = await supabase.from("profile_work_experiences").insert(
      parsed.workExperiences.map((item, index) => ({
        user_id: userId,
        company: item.company,
        title: item.title,
        start_date: item.startDate,
        end_date: item.endDate,
        is_current: item.isCurrent,
        responsibilities: item.responsibilities,
        sort_order: index,
      }))
    )
    if (error) throw error
  }

  if (parsed.education.length > 0) {
    const { error } = await supabase.from("profile_education").insert(
      parsed.education.map((item, index) => ({
        user_id: userId,
        institution: item.institution,
        degree: item.degree,
        field_of_study: item.fieldOfStudy,
        start_date: item.startDate,
        end_date: item.endDate,
        sort_order: index,
      }))
    )
    if (error) throw error
  }

  if (parsed.projects.length > 0) {
    const { error } = await supabase.from("profile_projects").insert(
      parsed.projects.map((item, index) => ({
        user_id: userId,
        name: item.name,
        description: item.description,
        url: item.url,
        technologies: item.technologies,
        sort_order: index,
      }))
    )
    if (error) throw error
  }

  if (parsed.certifications.length > 0) {
    const { error } = await supabase.from("profile_certifications").insert(
      parsed.certifications.map((item, index) => ({
        user_id: userId,
        name: item.name,
        issuer: item.issuer,
        issued_date: item.issuedDate,
        url: item.url,
        sort_order: index,
      }))
    )
    if (error) throw error
  }

  if (parsed.links.length > 0) {
    const { error } = await supabase.from("profile_links").insert(
      parsed.links.map((item, index) => ({
        user_id: userId,
        type: item.type,
        label: item.label,
        url: item.url,
        sort_order: index,
      }))
    )
    if (error) throw error
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export function buildStoragePath(
  userId: string,
  resumeId: string,
  fileName: string
): string {
  return `${userId}/${resumeId}/${sanitizeFileName(fileName)}`
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function actionError(message: string): ActionResult<never> {
  return { success: false, error: message }
}

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data }
}
