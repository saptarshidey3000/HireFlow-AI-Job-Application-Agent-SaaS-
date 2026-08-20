import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database, FullProfile } from "@/lib/supabase/database.types"

export async function getFullProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<FullProfile | null> {
  return getJobSearchProfile(supabase, userId, { includeExtras: true })
}

export async function getJobSearchProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: { includeExtras?: boolean }
): Promise<FullProfile | null> {
  const includeExtras = options?.includeExtras ?? false

  const profileQuery = supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  const [
    { data: profile, error: profileError },
    { data: skills, error: skillsError },
    { data: workExperiences, error: workError },
    { data: education, error: educationError },
    { data: projects, error: projectsError },
  ] = await Promise.all([
    profileQuery,
    supabase
      .from("profile_skills")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("profile_work_experiences")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("profile_education")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("profile_projects")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order"),
  ])

  let certifications: FullProfile["certifications"] = []
  let links: FullProfile["links"] = []
  let certsError = null
  let linksError = null

  if (includeExtras) {
    const [certsResult, linksResult] = await Promise.all([
      supabase
        .from("profile_certifications")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order"),
      supabase
        .from("profile_links")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order"),
    ])

    certifications = certsResult.data ?? []
    links = linksResult.data ?? []
    certsError = certsResult.error
    linksError = linksResult.error
  }

  const error =
    profileError ||
    skillsError ||
    workError ||
    educationError ||
    projectsError ||
    certsError ||
    linksError

  if (error) throw error
  if (!profile) return null

  return {
    profile,
    skills: skills ?? [],
    workExperiences: (workExperiences ?? []).map((item) => ({
      ...item,
      responsibilities: Array.isArray(item.responsibilities)
        ? (item.responsibilities as string[])
        : [],
    })),
    education: education ?? [],
    projects: (projects ?? []).map((item) => ({
      ...item,
      technologies: Array.isArray(item.technologies)
        ? (item.technologies as string[])
        : [],
    })),
    certifications,
    links,
  }
}
