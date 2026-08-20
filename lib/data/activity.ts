import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/database.types"
import type { JobActivityItem } from "@/lib/jobs/types"

function formatActivityDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export async function getRecentJobActivity(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<JobActivityItem[]> {
  const [profileRes, savedRes, appliedRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("updated_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("jobs")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .eq("saved_status", true)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("jobs")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .eq("applied_status", true)
      .order("updated_at", { ascending: false })
      .limit(3),
  ])

  const raw: Array<JobActivityItem & { sortDate: string }> = []

  const profile = profileRes.data
  if (profile?.updated_at) {
    raw.push({
      id: "resume-analyzed",
      label: "Resume analyzed & profile synced",
      timestamp: formatActivityDate(profile.updated_at),
      type: "resume",
      sortDate: profile.updated_at,
    })
  }

  for (const job of savedRes.data ?? []) {
    raw.push({
      id: `saved-${job.id}`,
      label: `Saved ${job.title}`,
      timestamp: formatActivityDate(job.updated_at),
      type: "saved",
      sortDate: job.updated_at,
    })
  }

  for (const job of appliedRes.data ?? []) {
    raw.push({
      id: `applied-${job.id}`,
      label: `Applied to ${job.title}`,
      timestamp: formatActivityDate(job.updated_at),
      type: "applied",
      sortDate: job.updated_at,
    })
  }

  return raw
    .sort(
      (a, b) =>
        new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      label: item.label,
      timestamp: item.timestamp,
      type: item.type,
    }))
}
