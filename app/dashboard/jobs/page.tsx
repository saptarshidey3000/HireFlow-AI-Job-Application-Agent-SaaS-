import { JobsPageClient } from "@/components/jobs/jobs-page"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { getRecentJobActivity } from "@/lib/data/activity"
import { getFullProfile } from "@/lib/data/profile"
import { resolveUserName } from "@/lib/profile/display-name"
import { createClient } from "@/lib/supabase/server"

export default async function JobsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub as string | undefined

  if (!userId) return null

  const [{ data: authData }, profile] = await Promise.all([
    supabase.auth.getUser(),
    getFullProfile(supabase, userId),
  ])

  if (!profile) {
    return (
      <DashboardEmptyState
        title="Jobs"
        description="Complete onboarding and upload your resume to unlock AI-powered job discovery."
      />
    )
  }

  const activity = await getRecentJobActivity(supabase, userId)
  const metadata = authData.user?.user_metadata as
    | { full_name?: string; name?: string }
    | undefined

  const userName = resolveUserName({
    profileFullName: profile.profile.full_name,
    profileEmail: profile.profile.email ?? authData.user?.email,
    authFullName: metadata?.full_name,
    authName: metadata?.name,
  })

  return (
    <JobsPageClient profile={profile} activity={activity} userName={userName} />
  )
}
