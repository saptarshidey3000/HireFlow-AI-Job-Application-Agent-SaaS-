import type { SupabaseClient } from "@supabase/supabase-js"

import { getCachedJobs, upsertJobs } from "@/lib/jobs/cache"
import {
  JobSearchUnavailableError,
  searchJobsWithCrawleoMany,
} from "@/lib/jobs/crawleo-search"
import { dedupeJobResults } from "@/lib/jobs/deduplicate"
import {
  mergeGeminiRefinement,
  refineTopMatchesWithGemini,
} from "@/lib/jobs/gemini-matching"
import {
  enrichNormalizedJob,
  jobMatchesFilters,
  normalizeSearchResult,
} from "@/lib/jobs/normalizer"
import { calculateResumeMatch } from "@/lib/jobs/matching"
import { buildProfileJobContext } from "@/lib/jobs/profile-context"
import {
  buildJobSearchQueries,
  buildSearchKey,
} from "@/lib/jobs/query-builder"
import { filterJobResults } from "@/lib/jobs/result-filter"
import type {
  JobDiscoverRequest,
  JobDiscoverResponse,
  JobMatchDetails,
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

function sortJobs(jobs: JobRecord[]): JobRecord[] {
  return jobs.slice().sort((a, b) => {
    if (b.match_score !== a.match_score) {
      return b.match_score - a.match_score
    }

    const aSkills = a.match_details.matchedSkills.length + a.match_details.matchedTechnologies.length
    const bSkills = b.match_details.matchedSkills.length + b.match_details.matchedTechnologies.length
    if (bSkills !== aSkills) {
      return bSkills - aSkills
    }

    return new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
  })
}

export async function discoverJobs(
  supabase: SupabaseClient<Database>,
  userId: string,
  profile: FullProfile,
  request: JobDiscoverRequest
): Promise<JobDiscoverResponse> {
  const targetRole = request.targetRole.trim()
  if (!targetRole) {
    return { jobs: [], cached: false, fetchedAt: null }
  }

  const context = buildProfileJobContext(profile, {
    targetRole,
    workModes: request.filters.workModes,
  })

  const searchKey = buildSearchKey(
    targetRole,
    context,
    request.platforms,
    request.filters
  )

  if (!request.forceRefresh) {
    const cached = await getCachedJobs(supabase, userId, searchKey)
    if (cached.jobs.length > 0 && cached.fetchedAt) {
      return {
        jobs: sortJobs(filterJobs(cached.jobs, request)),
        cached: true,
        fetchedAt: cached.fetchedAt,
      }
    }
  }

  const queries = buildJobSearchQueries(
    targetRole,
    context,
    request.filters,
    request.platforms
  )

  const rawResults = await searchJobsWithCrawleoMany(queries)
  const filteredResults = filterJobResults(rawResults)
  const dedupedResults = dedupeJobResults(filteredResults)

  const scoredCandidates = dedupedResults.map((result) => {
    const base = normalizeSearchResult(result, context.skills)
    const enriched = enrichNormalizedJob(base, context.skills)
    const { matchScore, matchDetails } = calculateResumeMatch(
      targetRole,
      context,
      {
        title: enriched.title,
        description: enriched.description,
        tags: enriched.tags,
        location: enriched.location,
        job_type: enriched.job_type,
        work_mode: enriched.work_mode,
        experience_level: enriched.experience_level,
      },
      request.filters
    )

    return {
      enriched,
      matchScore,
      matchDetails,
      snippet: result.snippet,
      jobUrl: enriched.job_url,
    }
  })

  const geminiRefinements = await refineTopMatchesWithGemini(
    targetRole,
    context,
    scoredCandidates.map((candidate) => ({
      title: candidate.enriched.title,
      snippet: candidate.snippet,
      matchScore: candidate.matchScore,
      matchDetails: candidate.matchDetails,
      jobUrl: candidate.jobUrl,
    }))
  )

  const normalizedJobs = scoredCandidates
    .map((candidate) => {
      const matchDetails: JobMatchDetails = mergeGeminiRefinement(
        candidate.matchDetails,
        geminiRefinements.get(candidate.jobUrl)
      )

      return {
        platform: candidate.enriched.platform,
        title: candidate.enriched.title,
        company: candidate.enriched.company,
        company_logo: candidate.enriched.company_logo ?? null,
        location: candidate.enriched.location ?? null,
        salary: candidate.enriched.salary ?? null,
        job_type: candidate.enriched.job_type,
        work_mode: candidate.enriched.work_mode,
        experience_level: candidate.enriched.experience_level ?? null,
        description: candidate.enriched.description ?? null,
        tags: candidate.enriched.tags,
        match_score: candidate.matchScore,
        match_details: matchDetails,
        job_url: candidate.enriched.job_url,
        source_url: candidate.enriched.source_url ?? null,
        applied_status: false,
        saved_status: false,
      }
    })
    .filter((job) =>
      jobMatchesFilters(
        job.job_type,
        job.work_mode,
        request.filters.jobTypes,
        request.filters.workModes
      )
    )

  const saved = await upsertJobs(supabase, userId, searchKey, normalizedJobs)

  return {
    jobs: sortJobs(filterJobs(saved, request)),
    cached: false,
    fetchedAt: saved[0]?.fetched_at ?? new Date().toISOString(),
  }
}

export { JobSearchUnavailableError }
