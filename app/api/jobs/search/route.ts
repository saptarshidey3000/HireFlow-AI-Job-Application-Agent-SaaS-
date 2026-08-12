import { NextResponse } from "next/server"

import {
  discoverJobs,
  JobSearchUnavailableError,
} from "@/lib/jobs/discover"
import type { JobDiscoverRequest } from "@/lib/jobs/types"
import { getFullProfile } from "@/lib/data/profile"
import { createClient } from "@/lib/supabase/server"

async function handleJobSearch(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims?.sub) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
  }

  const userId = data.claims.sub as string
  const body = (await request.json()) as JobDiscoverRequest

  const profile = await getFullProfile(supabase, userId)
  if (!profile) {
    return NextResponse.json({ error: "PROFILE_REQUIRED" }, { status: 400 })
  }

  const result = await discoverJobs(supabase, userId, profile, {
    platforms: body.platforms ?? [],
    filters: body.filters ?? {
      jobTypes: [],
      workModes: [],
    },
    forceRefresh: body.forceRefresh ?? false,
  })

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  try {
    return await handleJobSearch(request)
  } catch (error) {
    if (error instanceof JobSearchUnavailableError) {
      console.error("[jobs/search]", error.message)
      return NextResponse.json(
        { error: "JOB_SEARCH_UNAVAILABLE" },
        { status: 503 }
      )
    }

    console.error("[jobs/search]", error)
    return NextResponse.json(
      { error: "JOB_SEARCH_UNAVAILABLE" },
      { status: 503 }
    )
  }
}
