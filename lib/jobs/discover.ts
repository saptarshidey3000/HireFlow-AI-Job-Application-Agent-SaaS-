import type { SupabaseClient } from "@supabase/supabase-js"

import { getCachedJobs, upsertJobs } from "@/lib/jobs/cache"
import { resolveSerpLocationConfig } from "@/lib/jobs/location-config"
import { calculateResumeMatch } from "@/lib/jobs/matching"
import { buildProfileJobContext } from "@/lib/jobs/profile-context"
import {
  buildJobSearchQuery,
  buildSearchKey,
  sanitizeTargetRole,
} from "@/lib/jobs/query-builder"
import { jobMatchesFilters } from "@/lib/jobs/normalizer"
import { searchGoogleOrganic, SerpApiSearchError } from "@/lib/jobs/serpapi-client"
import {
  dedupeSerpJobs,
  normalizeGoogleOrganicResult,
  type NormalizedSerpJob,
} from "@/lib/jobs/serpapi-normalizer"
import { sortJobs } from "@/lib/jobs/sorting"
import type {
  JobDiscoverRequest,
  JobDiscoverResponse,
  JobFilters,
  JobMatchDetails,
  JobPlatform,
  JobRecord,
  JobSearchApiResponse,
  JobSortMode,
  JobType,
  WorkMode,
} from "@/lib/jobs/types"
import { getPlatformConfig, MULTI_SOURCE_PLATFORMS } from "@/lib/jobs/platforms"
import type { FullProfile } from "@/lib/supabase/database.types"
import type { Database } from "@/lib/supabase/database.types"

type JobUpsertInput = Parameters<typeof upsertJobs>[3][number]

function filterJobsByPlatform(
  jobs: JobRecord[],
  platforms: JobPlatform[]
): JobRecord[] {
  if (platforms.length === 0) return jobs
  return jobs.filter((job) => platforms.includes(job.platform as JobPlatform))
}

function filterNormalizedByPlatform(
  jobs: NormalizedSerpJob[],
  platforms: JobPlatform[]
): NormalizedSerpJob[] {
  if (platforms.length === 0) return jobs
  return jobs.filter(
    (job) => job.platform !== "unknown" && platforms.includes(job.platform)
  )
}

/**
 * Runs the single verified SerpApi search strategy (engine=google against organic_results).
 */
async function fetchSerpJobs(
  query: string,
  locationConfig: ReturnType<typeof resolveSerpLocationConfig>,
  selectedPlatforms: JobPlatform[],
  start: number,
  noCache: boolean
): Promise<{ jobs: NormalizedSerpJob[]; resultCount: number }> {
  let response: Awaited<ReturnType<typeof searchGoogleOrganic>>

  try {
    response = await searchGoogleOrganic({
      q: query,
      location: locationConfig.location,
      gl: locationConfig.gl,
      google_domain: locationConfig.google_domain,
      hl: locationConfig.hl,
      start: start > 0 ? start : undefined,
      noCache,
    })
  } catch (error) {
    if (error instanceof SerpApiSearchError && error.code === "NO_RESULTS") {
      response = { organic_results: [] }
    } else {
      throw error
    }
  }

  const organicResults = response.organic_results ?? []

  const normalized = organicResults
    .map((result) => normalizeGoogleOrganicResult(result))
    .filter((job): job is NormalizedSerpJob => job !== null)

  const deduped = dedupeSerpJobs(normalized)
  const filtered = filterNormalizedByPlatform(deduped, selectedPlatforms)

  return { jobs: filtered, resultCount: organicResults.length }
}

function toJobRecords(
  jobs: NormalizedSerpJob[],
  targetRole: string,
  context: ReturnType<typeof buildProfileJobContext>,
  request: JobDiscoverRequest,
  discoveredAt: string
): JobUpsertInput[] {
  return jobs.map((job) => {
    const { matchScore, matchDetails } = calculateResumeMatch(
      targetRole,
      context,
      {
        title: job.title,
        description: job.description ?? job.snippet,
        tags: job.tags,
        location: job.location,
        job_type: job.jobType,
        work_mode: job.workMode,
        experience_level: job.experienceLevel,
      },
      request.filters
    )

    return {
      platform: job.platform === "unknown" ? "unknown" : job.platform,
      title: job.title,
      company: job.company,
      company_logo: job.companyLogo,
      location: job.location,
      salary: job.salary,
      job_type: job.jobType,
      work_mode: job.workMode,
      experience_level: job.experienceLevel,
      description: job.description ?? job.snippet,
      tags: job.tags,
      match_score: matchScore,
      match_details: matchDetails as JobMatchDetails,
      job_url: job.applyUrl,
      source_url: job.url,
      published_at: job.publishedAt,
      published_at_text: job.publishedAtText,
      discovered_at: discoveredAt,
      applied_status: false,
      saved_status: false,
    }
  })
}

export async function discoverJobs(
  supabase: SupabaseClient<Database>,
  userId: string,
  profile: FullProfile,
  request: JobDiscoverRequest
): Promise<JobDiscoverResponse> {
  const targetRole = sanitizeTargetRole(request.targetRole)
  const safeFilters: JobFilters = request.filters ?? {
    jobTypes: [],
    workModes: [],
    location: undefined,
    experienceLevel: undefined,
    salaryMin: undefined,
    postedWithin: undefined,
  }

  const sortMode: JobSortMode = request.sortMode ?? "latest"
  const selectedPlatforms =
    request.platforms && request.platforms.length > 0
      ? request.platforms
      : MULTI_SOURCE_PLATFORMS

  if (!targetRole) {
    return {
      jobs: [],
      cached: false,
      fetchedAt: null,
      sortMode,
      pagination: { hasMore: false, nextPageToken: null },
      total: 0,
    }
  }

  const context = buildProfileJobContext(profile, {
    targetRole,
    workModes: safeFilters.workModes,
  })

  const locationConfig = resolveSerpLocationConfig(
    safeFilters.location,
    context.location
  )

  const searchKey = buildSearchKey({
    targetRole,
    location: locationConfig.location,
    platforms: selectedPlatforms,
    filters: safeFilters,
    jobTypes: safeFilters.jobTypes,
    workModes: safeFilters.workModes,
    experienceLevel: safeFilters.experienceLevel,
  })

  if (!request.forceRefresh && !request.nextPageToken) {
    const cached = await getCachedJobs(supabase, userId, searchKey, sortMode)
    if (cached.jobs.length > 0 && cached.fetchedAt) {
      const filtered = filterJobsByPlatform(
        jobMatchesFiltersOnly(cached.jobs, safeFilters),
        selectedPlatforms
      )
      return {
        jobs: sortJobs(filtered, sortMode, targetRole),
        cached: true,
        fetchedAt: cached.fetchedAt,
        sortMode,
        pagination: { hasMore: false, nextPageToken: null },
        total: filtered.length,
      }
    }
  }

  const query = buildJobSearchQuery(targetRole)

  // Server-side logging only (Requirement 26). Never log SERPAPI_API_KEY.
  console.log(`[Job Search]\nTarget Role: ${targetRole}\nQuery: ${query}`)

  const start = request.nextPageToken ? Number(request.nextPageToken) || 0 : 0

  const { jobs: fetchedJobs, resultCount } = await fetchSerpJobs(
    query,
    locationConfig,
    selectedPlatforms,
    start,
    request.forceRefresh ?? false
  )

  const discoveredAt = new Date().toISOString()
  const normalizedJobs = toJobRecords(
    fetchedJobs,
    targetRole,
    context,
    { ...request, filters: safeFilters },
    discoveredAt
  ).filter((job) =>
    jobMatchesFilters(
      (job.job_type as JobType | null) ?? null,
      (job.work_mode as WorkMode | null) ?? null,
      safeFilters.jobTypes,
      safeFilters.workModes
    )
  )

  let saved: JobRecord[] = []

  if (request.append && request.nextPageToken) {
    const existing = await getCachedJobs(supabase, userId, searchKey, sortMode)
    const mergedByUrl = new Map<string, JobUpsertInput>()

    for (const job of existing.jobs) {
      mergedByUrl.set(job.job_url, {
        platform: job.platform,
        title: job.title,
        company: job.company,
        company_logo: job.company_logo,
        location: job.location,
        salary: job.salary,
        job_type: job.job_type,
        work_mode: job.work_mode,
        experience_level: job.experience_level,
        description: job.description,
        tags: job.tags,
        match_score: job.match_score,
        match_details: job.match_details,
        job_url: job.job_url,
        source_url: job.source_url,
        published_at: job.published_at,
        published_at_text: job.published_at_text,
        discovered_at: job.discovered_at,
        applied_status: job.applied_status,
        saved_status: job.saved_status,
      })
    }

    for (const job of normalizedJobs) {
      mergedByUrl.set(job.job_url, job)
    }

    saved = await upsertJobs(
      supabase,
      userId,
      searchKey,
      Array.from(mergedByUrl.values())
    )
  } else if (normalizedJobs.length > 0) {
    saved = await upsertJobs(supabase, userId, searchKey, normalizedJobs)
  }

  const filtered = filterJobsByPlatform(
    jobMatchesFiltersOnly(saved, safeFilters),
    selectedPlatforms
  )

  const hasMore = resultCount >= 10

  return {
    jobs: sortJobs(filtered, sortMode, targetRole),
    cached: false,
    fetchedAt: saved[0]?.fetched_at ?? discoveredAt,
    sortMode,
    pagination: {
      hasMore,
      nextPageToken: hasMore ? String(start + 10) : null,
    },
    total: filtered.length,
  }
}

function jobMatchesFiltersOnly(
  jobs: JobRecord[],
  filters: JobFilters
): JobRecord[] {
  return jobs.filter((job) =>
    jobMatchesFilters(
      job.job_type,
      job.work_mode,
      filters.jobTypes,
      filters.workModes
    )
  )
}

export function toJobSearchApiResponse(
  result: JobDiscoverResponse,
  request: JobDiscoverRequest,
  profileLocation: string | null,
  searchTimeMs: number
): JobSearchApiResponse {
  const location =
    request.filters?.location?.trim() || profileLocation || "India"

  return {
    success: true,
    jobs: result.jobs,
    total: result.total,
    search: {
      targetRole: sanitizeTargetRole(request.targetRole),
      location,
      platforms: (request.platforms && request.platforms.length > 0
        ? request.platforms
        : MULTI_SOURCE_PLATFORMS
      ).map((platform) => getPlatformConfig(platform).name),
    },
    pagination: result.pagination,
    meta: {
      provider: "serpapi",
      searchTimeMs,
      cached: result.cached,
    },
  }
}

export function toJobSearchApiError(error: unknown): JobSearchApiResponse {
  if (error instanceof SerpApiSearchError) {
    const message =
      error.code === "RATE_LIMITED"
        ? "Job search is temporarily rate limited. Try again shortly."
        : error.code === "INVALID_REQUEST"
          ? "Job search is not configured correctly."
          : error.message.includes("SERPAPI_API_KEY")
            ? "Job search is not configured. Add SERPAPI_API_KEY to .env.local and restart the server."
            : "Unable to fetch jobs right now."

    return {
      success: false,
      error: {
        code: error.code,
        message,
      },
    }
  }

  return {
    success: false,
    error: {
      code: "SEARCH_PROVIDER_ERROR",
      message: "Unable to fetch jobs right now.",
    },
  }
}

export { SerpApiSearchError as JobSearchUnavailableError } from "@/lib/jobs/serpapi-client"
