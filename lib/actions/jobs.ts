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
    return { success: true, job: mapJobRow(data) }
  } catch {
    return { success: false, error: "Could not update saved status." }
  }
}
