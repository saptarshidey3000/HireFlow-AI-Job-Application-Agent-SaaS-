import type { SupabaseClient } from "@supabase/supabase-js"

import { getCachedJobs, upsertJobs } from "@/lib/jobs/cache"
import { resolveSerpLocationConfig } from "@/lib/jobs/location-config"
import { calculateResumeMatch } from "@/lib/jobs/matching"
import { buildProfileJobContext } from "@/lib/jobs/profile-context"
import {
  buildJobSearchQuery,
  buildPlatformFallbackQueries,
  buildSearchKey,
} from "@/lib/jobs/query-builder"
import { jobMatchesFilters } from "@/lib/jobs/normalizer"
import {
  searchGoogleJobs,
  searchGoogleOrganic,
  SerpApiSearchError,
} from "@/lib/jobs/serpapi-client"
import {
  dedupeSerpJobs,
  normalizeGoogleJobsResult,
  normalizeGoogleOrganicResult,
  type NormalizedSerpJob,
} from "@/lib/jobs/serpapi-normalizer"
import { sortJobs } from "@/lib/jobs/sorting"
import type {
  JobDiscoverRequest,
  JobDiscoverResponse,
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

function countPlatforms(jobs: NormalizedSerpJob[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const job of jobs) {
    if (job.platform === "unknown") continue
    counts[job.platform] = (counts[job.platform] ?? 0) + 1
  }
  return counts
}

async function fetchSerpJobs(
  request: JobDiscoverRequest,
  context: ReturnType<typeof buildProfileJobContext>,
  locationConfig: ReturnType<typeof resolveSerpLocationConfig>,
  query: string,
  selectedPlatforms: JobPlatform[],
  noCache: boolean
): Promise<{
  jobs: NormalizedSerpJob[]
  nextPageToken: string | null
}> {
  let googleJobsResponse: Awaited<ReturnType<typeof searchGoogleJobs>>

  try {
    googleJobsResponse = await searchGoogleJobs({
      q: query,
      location: locationConfig.location,
      gl: locationConfig.gl,
      google_domain: locationConfig.google_domain,
      hl: locationConfig.hl,
      noCache,
      nextPageToken: request.nextPageToken,
    })
  } catch (error) {
    if (error instanceof SerpApiSearchError && error.code === "NO_RESULTS") {
      googleJobsResponse = { jobs_results: [] }
    } else {
      throw error
    }
  }

  const primaryJobs = (googleJobsResponse.jobs_results ?? [])
    .map(normalizeGoogleJobsResult)
    .filter((job): job is NormalizedSerpJob => job !== null)

  const platformCounts = countPlatforms(primaryJobs)
  const underrepresented = selectedPlatforms.filter(
    (platform) => (platformCounts[platform] ?? 0) < 1
  )

  const fallbackJobs: NormalizedSerpJob[] = []

  if (underrepresented.length > 0 && !request.nextPageToken) {
    const fallbackQueries = buildPlatformFallbackQueries(
      underrepresented,
      request.targetRole.trim(),
      locationConfig.location
    )

    const fallbackResponses = await Promise.all(
      fallbackQueries.map(async ({ platform, query: fallbackQuery }) => {
        try {
          const response = await searchGoogleOrganic({
            q: fallbackQuery,
            location: locationConfig.location,
            gl: locationConfig.gl,
            google_domain: locationConfig.google_domain,
            hl: locationConfig.hl,
            noCache,
          })

          return (response.organic_results ?? [])
            .map((result) => normalizeGoogleOrganicResult(result, platform))
            .filter((job): job is NormalizedSerpJob => job !== null)
        } catch (error) {
          console.error(
            `[jobs/serpapi] fallback failed for ${platform}`,
            error instanceof Error ? error.message : error
          )
          return []
        }
      })
    )

    fallbackJobs.push(...fallbackResponses.flat())
  }

  const merged = dedupeSerpJobs([
    ...filterNormalizedByPlatform(primaryJobs, selectedPlatforms),
    ...filterNormalizedByPlatform(fallbackJobs, selectedPlatforms),
  ])

  return {
    jobs: merged,
    nextPageToken: googleJobsResponse.serpapi_pagination?.next_page_token ?? null,
  }
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
      platform: job.platform === "unknown" ? "google_jobs" : job.platform,
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
  const targetRole = request.targetRole.trim()
  const sortMode: JobSortMode = request.sortMode ?? "latest"
  const selectedPlatforms =
    request.platforms.length > 0 ? request.platforms : MULTI_SOURCE_PLATFORMS

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
    workModes: request.filters.workModes,
  })

  const locationConfig = resolveSerpLocationConfig(
    request.filters.location,
    context.location
  )

  const searchKey = buildSearchKey(
    targetRole,
    context,
    selectedPlatforms,
    request.filters
  )

  if (!request.forceRefresh && !request.nextPageToken) {
    const cached = await getCachedJobs(supabase, userId, searchKey, sortMode)
    if (cached.jobs.length > 0 && cached.fetchedAt) {
      const filtered = filterJobsByPlatform(
        jobMatchesFiltersOnly(cached.jobs, request),
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

  const query = buildJobSearchQuery({
    targetRole,
    context,
    filters: request.filters,
  })

  const { jobs: fetchedJobs, nextPageToken } = await fetchSerpJobs(
    request,
    context,
    locationConfig,
    query,
    selectedPlatforms,
    request.forceRefresh ?? false
  )

  const discoveredAt = new Date().toISOString()
  const normalizedJobs = toJobRecords(
    fetchedJobs,
    targetRole,
    context,
    request,
    discoveredAt
  ).filter((job) =>
    jobMatchesFilters(
      (job.job_type as JobType | null) ?? null,
      (job.work_mode as WorkMode | null) ?? null,
      request.filters.jobTypes,
      request.filters.workModes
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
    jobMatchesFiltersOnly(saved, request),
    selectedPlatforms
  )

  return {
    jobs: sortJobs(filtered, sortMode, targetRole),
    cached: false,
    fetchedAt: saved[0]?.fetched_at ?? discoveredAt,
    sortMode,
    pagination: {
      hasMore: Boolean(nextPageToken),
      nextPageToken,
    },
    total: filtered.length,
  }
}

function jobMatchesFiltersOnly(
  jobs: JobRecord[],
  request: JobDiscoverRequest
): JobRecord[] {
  return jobs.filter((job) =>
    jobMatchesFilters(
      job.job_type,
      job.work_mode,
      request.filters.jobTypes,
      request.filters.workModes
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
    request.filters.location?.trim() || profileLocation || "United States"

  return {
    success: true,
    jobs: result.jobs,
    total: result.total,
    search: {
      targetRole: request.targetRole.trim(),
      location,
      platforms: (request.platforms.length > 0
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
