import { JobsPageClient } from "@/components/jobs/jobs-page"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { getRecentJobActivity } from "@/lib/data/activity"
import { getFullProfile } from "@/lib/data/profile"
import { createClient } from "@/lib/supabase/server"

export default async function JobsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub as string | undefined

  if (!userId) return null

  const profile = await getFullProfile(supabase, userId)

  if (!profile) {
    return (
      <DashboardEmptyState
        title="Jobs"
        description="Complete onboarding and upload your resume to unlock AI-powered job discovery."
      />
    )
  }

  const activity = await getRecentJobActivity(supabase, userId)

  return <JobsPageClient profile={profile} activity={activity} />
}
