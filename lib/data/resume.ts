import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database, Resume } from "@/lib/supabase/database.types"

export async function getActiveResume(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Resume | null> {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getResumeById(
  supabase: SupabaseClient<Database>,
  resumeId: string,
  userId: string
): Promise<Resume | null> {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error
  return data
}
