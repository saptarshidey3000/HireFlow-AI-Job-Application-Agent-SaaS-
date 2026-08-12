import type { SupabaseClient } from "@supabase/supabase-js"

import { getCachedJobs, upsertJobs } from "@/lib/jobs/cache"
import {
  JobSearchUnavailableError,
  searchJobsWithCrawleoMany,
} from "@/lib/jobs/crawleo-search"
import { dedupeJobResults } from "@/lib/jobs/deduplicate"
import {
  enrichNormalizedJob,
  jobMatchesFilters,
  normalizeSearchResult,
} from "@/lib/jobs/normalizer"
import { calculateMatchScore } from "@/lib/jobs/matching"
import { buildProfileJobContext } from "@/lib/jobs/profile-context"
import {
  buildJobSearchQueries,
  buildSearchKey,
} from "@/lib/jobs/query-builder"
import { filterJobResults } from "@/lib/jobs/result-filter"
import type {
  JobDiscoverRequest,
  JobDiscoverResponse,
  JobPlatform,
  JobRecord,
} from "@/lib/jobs/types"
import type { FullProfile } from "@/lib/supabase/database.types"
import type { Database } from "@/lib/supabase/database.types"

function filterJobs(
  jobs: JobRecord[],
  request: JobDiscoverRequest
): JobRecord[] {
  return jobs.filter((job) => {
    const platformOk =
      request.platforms.length === 0 ||
      request.platforms.includes(job.platform as JobPlatform)

    if (!platformOk) return false

    return jobMatchesFilters(
      job.job_type,
      job.work_mode,
      request.filters.jobTypes,
      request.filters.workModes
    )
  })
}

export async function discoverJobs(
  supabase: SupabaseClient<Database>,
  userId: string,
  profile: FullProfile,
  request: JobDiscoverRequest
): Promise<JobDiscoverResponse> {
  const context = buildProfileJobContext(profile, {
    workModes: request.filters.workModes,
  })
  const searchKey = buildSearchKey(
    context,
    request.platforms,
    request.filters
  )

  if (!request.forceRefresh) {
    const cached = await getCachedJobs(supabase, userId, searchKey)
    if (cached.jobs.length > 0 && cached.fetchedAt) {
      return {
        jobs: filterJobs(cached.jobs, request),
        cached: true,
        fetchedAt: cached.fetchedAt,
      }
    }
  }

  const queries = buildJobSearchQueries(
    context,
    request.filters,
    request.platforms
  )

  const rawResults = await searchJobsWithCrawleoMany(queries)
  const filteredResults = filterJobResults(rawResults)
  const dedupedResults = dedupeJobResults(filteredResults)

  const normalizedJobs = dedupedResults.map((result) => {
    const base = normalizeSearchResult(result, context.skills)
    const enriched = enrichNormalizedJob(base, context.skills)
    const matchScore = calculateMatchScore(context, {
      title: enriched.title,
      description: enriched.description,
      tags: enriched.tags,
      location: enriched.location,
      job_type: enriched.job_type,
      work_mode: enriched.work_mode,
      experience_level: enriched.experience_level,
      platform: enriched.platform,
    })

    return {
      platform: enriched.platform,
      title: enriched.title,
      company: enriched.company,
      company_logo: enriched.company_logo ?? null,
      location: enriched.location ?? null,
      salary: enriched.salary ?? null,
      job_type: enriched.job_type,
      work_mode: enriched.work_mode,
      experience_level: enriched.experience_level ?? null,
      description: enriched.description ?? null,
      tags: enriched.tags,
      match_score: matchScore,
      job_url: enriched.job_url,
      source_url: enriched.source_url ?? null,
      applied_status: false,
      saved_status: false,
    }
  })

  const filtered = normalizedJobs
    .filter((job) =>
      jobMatchesFilters(
        job.job_type,
        job.work_mode,
        request.filters.jobTypes,
        request.filters.workModes
      )
    )
    .sort((a, b) => b.match_score - a.match_score)

  const saved = await upsertJobs(supabase, userId, searchKey, filtered)

  return {
    jobs: filterJobs(saved, request),
    cached: false,
    fetchedAt: saved[0]?.fetched_at ?? new Date().toISOString(),
  }
}

export { JobSearchUnavailableError }
