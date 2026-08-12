import type { SupabaseClient } from "@supabase/supabase-js"

import type { JobActivityItem } from "@/lib/jobs/types"
import type { Database } from "@/lib/supabase/database.types"

function formatActivityDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export async function getRecentJobActivity(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<JobActivityItem[]> {
  const [{ data: resume }, { data: savedJobs }, { data: appliedJobs }] =
    await Promise.all([
      supabase
        .from("resumes")
        .select("uploaded_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle(),
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

  if (resume?.uploaded_at) {
    raw.push({
      id: "resume-updated",
      label: "Resume updated",
      timestamp: formatActivityDate(resume.uploaded_at),
      type: "resume",
      sortDate: resume.uploaded_at,
    })
  }

  for (const job of savedJobs ?? []) {
    raw.push({
      id: `saved-${job.id}`,
      label: `Saved ${job.title}`,
      timestamp: formatActivityDate(job.updated_at),
      type: "saved",
      sortDate: job.updated_at,
    })
  }

  for (const job of appliedJobs ?? []) {
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
    .map(({ sortDate: _, ...item }) => item)
}
