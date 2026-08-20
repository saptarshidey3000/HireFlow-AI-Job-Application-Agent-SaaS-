"use server"

import { revalidatePath } from "next/cache"

import { getAuthenticatedSupabase } from "@/lib/auth/session"
import { mapJobRow } from "@/lib/jobs/cache"
import type { JobRecord } from "@/lib/jobs/types"

export async function toggleJobSaved(
  jobId: string,
  saved: boolean
): Promise<{ success: true; job: JobRecord } | { success: false; error: string }> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()

    const { data, error } = await supabase
      .from("jobs")
      .update({ saved_status: saved })
      .eq("id", jobId)
      .eq("user_id", userId)
      .select("*")
      .single()

    if (error || !data) {
      return { success: false, error: "Could not update saved status." }
    }

    revalidatePath("/dashboard/jobs")
    revalidatePath("/dashboard/saved-jobs")
    return { success: true, job: mapJobRow(data) }
  } catch {
    return { success: false, error: "Could not update saved status." }
  }
}

export async function getSavedJobs(): Promise<{
  success: true
  jobs: JobRecord[]
} | {
  success: false
  error: string
}> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()

    // Fetch saved jobs for the user
    const [jobsRes, applicationsRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("*")
        .eq("user_id", userId)
        .eq("saved_status", true)
        .order("updated_at", { ascending: false }),
      supabase
        .from("job_applications")
        .select("id, job_id, job_url, status, applied_at")
        .eq("user_id", userId),
    ])

    if (jobsRes.error) {
      return { success: false, error: "Failed to fetch saved jobs." }
    }

    const applications = applicationsRes.data || []
    const appliedJobIds = new Set<string>()
    const appliedJobUrls = new Set<string>()

    for (const app of applications) {
      if (app.status === "APPLIED") {
        if (app.job_id) appliedJobIds.add(app.job_id)
        if (app.job_url) appliedJobUrls.add(app.job_url)
      }
    }

    const mappedJobs = (jobsRes.data || []).map((row) => {
      const job = mapJobRow(row)
      // Ensure applied_status reflects real application history from DB
      const isApplied =
        job.applied_status ||
        appliedJobIds.has(job.id) ||
        appliedJobUrls.has(job.job_url)

      return {
        ...job,
        applied_status: isApplied,
      }
    })

    return { success: true, jobs: mappedJobs }
  } catch {
    return { success: false, error: "Failed to load saved jobs." }
  }
}
