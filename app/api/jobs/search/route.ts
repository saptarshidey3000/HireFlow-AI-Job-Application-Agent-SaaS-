import { NextResponse } from "next/server"

import {
  discoverJobs,
  toJobSearchApiError,
  toJobSearchApiResponse,
} from "@/lib/jobs/discover"
import { sanitizeTargetRole } from "@/lib/jobs/query-builder"
import { SerpApiSearchError } from "@/lib/jobs/serpapi-client"
import type { JobDiscoverRequest } from "@/lib/jobs/types"
import { getJobSearchProfile } from "@/lib/data/profile"
import { createClient } from "@/lib/supabase/server"

async function handleJobSearch(request: Request) {
  const startedAt = Date.now()
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims?.sub) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be signed in to search jobs.",
        },
      },
      { status: 401 }
    )
  }

  const userId = data.claims.sub as string
  const body = (await request.json()) as JobDiscoverRequest

  const sanitizedRole = sanitizeTargetRole(body.targetRole)
  if (!sanitizedRole) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TARGET_ROLE_REQUIRED",
          message: "Target role is required.",
        },
      },
      { status: 400 }
    )
  }

  const profile = await getJobSearchProfile(supabase, userId)
  if (!profile) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROFILE_REQUIRED",
          message: "Complete your profile before searching for jobs.",
        },
      },
      { status: 400 }
    )
  }

  const location = body.filters?.location?.trim() || profile.profile.location?.trim() || "India"
  const safeFilters = {
    jobTypes: body.filters?.jobTypes ?? [],
    workModes: body.filters?.workModes ?? [],
    location,
    experienceLevel: body.filters?.experienceLevel ?? undefined,
    salaryMin: body.filters?.salaryMin ?? undefined,
    postedWithin: body.filters?.postedWithin ?? undefined,
  }

  const result = await discoverJobs(supabase, userId, profile, {
    targetRole: sanitizedRole,
    platforms: body.platforms ?? [],
    filters: safeFilters,
    sortMode: body.sortMode,
    forceRefresh: body.forceRefresh ?? false,
    nextPageToken: body.nextPageToken,
    append: body.append ?? false,
  })

  return NextResponse.json(
    toJobSearchApiResponse(
      result,
      {
        ...body,
        targetRole: sanitizedRole,
        filters: safeFilters,
      },
      location,
      Date.now() - startedAt
    )
  )
}

export async function POST(request: Request) {
  try {
    return await handleJobSearch(request)
  } catch (error) {
    if (error instanceof SerpApiSearchError) {
      console.error("[jobs/search]", error.code, error.message)
    } else {
      console.error("[jobs/search]", error)
    }

    const payload = toJobSearchApiError(error)
    const status =
      error instanceof SerpApiSearchError
        ? error.code === "INVALID_REQUEST"
          ? 400
          : error.code === "RATE_LIMITED"
            ? 429
            : 503
        : 503

    return NextResponse.json(payload, { status })
  }
}
