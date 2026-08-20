import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/database.types"
import type { JobMatchDetails, JobRecord, JobSortMode } from "@/lib/jobs/types"

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const LATEST_CACHE_TTL_MS = 60 * 60 * 1000

const EMPTY_MATCH_DETAILS: JobMatchDetails = {
  matchedSkills: [],
  missingSkills: [],
  matchedTechnologies: [],
  experienceMatch: false,
  locationMatch: false,
  jobTypeMatch: false,
  matchReason: "",
}

export function getCacheTtlMs(sortMode: JobSortMode): number {
  return sortMode === "best_match" ? CACHE_TTL_MS : LATEST_CACHE_TTL_MS
}

export function isCacheFresh(
  fetchedAt: string | null,
  sortMode: JobSortMode = "latest"
): boolean {
  if (!fetchedAt) return false
  return Date.now() - new Date(fetchedAt).getTime() < getCacheTtlMs(sortMode)
}

function toMatchDetailsJson(details: JobMatchDetails): Record<string, unknown> {
  return { ...details }
}

function parseMatchDetails(value: unknown): JobMatchDetails {
  if (!value || typeof value !== "object") {
    return { ...EMPTY_MATCH_DETAILS }
  }

  const details = value as Partial<JobMatchDetails>
  return {
    matchedSkills: Array.isArray(details.matchedSkills)
      ? details.matchedSkills.filter((item): item is string => typeof item === "string")
      : [],
    missingSkills: Array.isArray(details.missingSkills)
      ? details.missingSkills.filter((item): item is string => typeof item === "string")
      : [],
    matchedTechnologies: Array.isArray(details.matchedTechnologies)
      ? details.matchedTechnologies.filter((item): item is string => typeof item === "string")
      : [],
    experienceMatch: Boolean(details.experienceMatch),
    locationMatch: Boolean(details.locationMatch),
    jobTypeMatch: Boolean(details.jobTypeMatch),
    matchReason:
      typeof details.matchReason === "string" ? details.matchReason : "",
  }
}

export async function getCachedJobs(
  supabase: SupabaseClient<Database>,
  userId: string,
  searchKey: string,
  sortMode: JobSortMode = "latest"
): Promise<{ jobs: JobRecord[]; fetchedAt: string | null }> {
  const cutoff = new Date(Date.now() - getCacheTtlMs(sortMode)).toISOString()

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("search_key", searchKey)
    .gte("fetched_at", cutoff)
    .order("published_at", { ascending: false, nullsFirst: false })

  if (error) throw error

  const jobs = (data ?? []).map(mapJobRow)
  const fetchedAt = jobs[0]?.fetched_at ?? null

  return { jobs, fetchedAt }
}

export function mapJobRow(row: Database["public"]["Tables"]["jobs"]["Row"]): JobRecord {
  return {
    ...row,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    job_type: row.job_type as JobRecord["job_type"],
    work_mode: row.work_mode as JobRecord["work_mode"],
    match_details: parseMatchDetails(row.match_details),
    published_at: row.published_at ?? null,
    published_at_text: row.published_at_text ?? null,
    discovered_at: row.discovered_at ?? row.fetched_at,
  }
}

export async function upsertJobs(
  supabase: SupabaseClient<Database>,
  userId: string,
  searchKey: string,
  jobs: Array<
    Omit<
      Database["public"]["Tables"]["jobs"]["Insert"],
      "user_id" | "search_key" | "fetched_at" | "match_details"
    > & {
      match_details: JobMatchDetails
    }
  >
): Promise<JobRecord[]> {
  const fetchedAt = new Date().toISOString()
  const discoveredAt = fetchedAt

  const urls = jobs.map((job) => job.job_url)
  const { data: existing } = await supabase
    .from("jobs")
    .select("job_url, saved_status, applied_status, discovered_at")
    .eq("user_id", userId)
    .in("job_url", urls)

  const existingMap = new Map(
    (existing ?? []).map((row) => [row.job_url, row])
  )

  const rows = jobs.map((job) => {
    const prev = existingMap.get(job.job_url)
    return {
      ...job,
      user_id: userId,
      search_key: searchKey,
      fetched_at: fetchedAt,
      discovered_at: prev?.discovered_at ?? job.discovered_at ?? discoveredAt,
      saved_status: prev?.saved_status ?? job.saved_status ?? false,
      applied_status: prev?.applied_status ?? job.applied_status ?? false,
      match_details: toMatchDetailsJson(job.match_details),
    }
  })

  if (rows.length === 0) return []

  const { data, error } = await supabase
    .from("jobs")
    .upsert(rows, { onConflict: "user_id,job_url" })
    .select("*")

  if (error) throw error

  return (data ?? []).map(mapJobRow)
}
