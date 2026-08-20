import { redirect } from "next/navigation"

import { SavedJobsPageClient } from "@/components/jobs/saved-jobs-page"
import { getSavedJobs } from "@/lib/actions/jobs"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function SavedJobsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub as string | undefined

  if (!userId) {
    redirect("/login")
  }

  const result = await getSavedJobs()
  const savedJobs = result.success ? result.jobs : []

  return <SavedJobsPageClient initialJobs={savedJobs} />
}
