import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database, OnboardingStatus } from "@/lib/supabase/database.types"

export async function getOnboardingStatus(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<OnboardingStatus> {
  const [{ data: profile }, { data: resume }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("resumes")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),
  ])

  const hasResume = Boolean(resume)
  const onboardingCompleted = profile?.onboarding_completed ?? false

  return {
    isComplete: onboardingCompleted && hasResume,
    hasResume,
    onboardingCompleted,
  }
}
