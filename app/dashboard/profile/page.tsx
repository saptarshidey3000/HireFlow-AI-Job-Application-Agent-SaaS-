import { ProfilePageClient } from "@/components/profile/profile-page"
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { getFullProfile } from "@/lib/data/profile"
import { createClient } from "@/lib/supabase/server"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub as string | undefined

  if (!userId) return null

  const profile = await getFullProfile(supabase, userId)

  if (!profile) {
    return (
      <DashboardEmptyState
        title="Profile"
        description="Complete onboarding by uploading your resume to build your profile."
      />
    )
  }

  return <ProfilePageClient profile={profile} />
}
