"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { JobFiltersPanel } from "@/components/jobs/job-filters"
import { JobList } from "@/components/jobs/job-list"
import { JobsProfileCompleteness } from "@/components/jobs/jobs-profile-completeness"
import { PlatformSelector } from "@/components/jobs/platform-selector"
import { RecentActivity } from "@/components/jobs/recent-activity"
import { TargetRoleSearch } from "@/components/jobs/target-role-search"
import { WelcomeBanner } from "@/components/jobs/welcome-banner"
import { DEFAULT_PLATFORMS } from "@/lib/jobs/platforms"
import { inferTargetRole } from "@/lib/jobs/profile-context"
import { sortJobs } from "@/lib/jobs/sorting"
import type {
  JobActivityItem,
  JobFilters,
  JobPlatform,
  JobRecord,
  JobSearchApiResponse,
  JobSortMode,
} from "@/lib/jobs/types"
import type { FullProfile } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

const EMPTY_FILTERS: JobFilters = {
  jobTypes: [],
  workModes: [],
  location: "",
  experienceLevel: "",
  salaryMin: "",
  postedWithin: "",
}

export function JobsPageClient({
  profile,
  activity,
  userName,
}: {
  profile: FullProfile
  activity: JobActivityItem[]
  userName: string
}) {
  const defaultRole = useMemo(() => inferTargetRole(profile), [profile])
  const defaultLocation = profile.profile.location ?? ""

  const [targetRoleDraft, setTargetRoleDraft] = useState(defaultRole)
  const [activeTargetRole, setActiveTargetRole] = useState(defaultRole)
  const [platforms, setPlatforms] = useState<JobPlatform[]>(DEFAULT_PLATFORMS)
  const [filters, setFilters] = useState<JobFilters>({
    ...EMPTY_FILTERS,
    location: defaultLocation,
  })
  const [sortMode, setSortMode] = useState<JobSortMode>("latest")
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const platformRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipDebounceRef = useRef(false)
  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const sortedJobs = useMemo(
    () => sortJobs(jobs, sortMode, activeTargetRole),
    [jobs, sortMode, activeTargetRole]
  )

  const platformCounts = useMemo(() => {
    const counts: Partial<Record<JobPlatform, number>> = {}
    for (const job of sortedJobs) {
      const platform = job.platform as JobPlatform
      if (platform in counts || DEFAULT_PLATFORMS.includes(platform)) {
        counts[platform] = (counts[platform] ?? 0) + 1
      }
    }
    return counts
  }, [sortedJobs])

  const fetchJobs = useCallback(
    async (
      targetRole: string,
      options?: {
        forceRefresh?: boolean
        append?: boolean
        pageToken?: string | null
      }
    ) => {
      const trimmedRole = targetRole.trim()
      if (!trimmedRole) {
        setJobs([])
        setLoading(false)
        setSearching(false)
        setError(null)
        return
      }

      const requestId = ++requestIdRef.current
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setSearching(true)
      setError(null)

      try {
        const response = await fetch("/api/jobs/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetRole: trimmedRole,
            platforms,
            filters,
            forceRefresh: options?.forceRefresh ?? false,
            nextPageToken: options?.pageToken ?? undefined,
            append: options?.append ?? false,
          }),
          signal: controller.signal,
        })

        const data = (await response.json()) as JobSearchApiResponse

        if (requestId !== requestIdRef.current) {
          return
        }

        if (!response.ok || !data.success) {
          setError(
            data.success
              ? "Unable to fetch jobs right now."
              : data.error.message
          )
          if (!options?.append) {
            // Keep previous successful list visible during provider errors.
          }
          return
        }

        setJobs((prev) =>
          options?.append ? mergeJobs(prev, data.jobs) : data.jobs
        )
        setHasMore(data.pagination.hasMore)
        setNextPageToken(data.pagination.nextPageToken)
        setError(null)
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return
        }
        if (requestId === requestIdRef.current) {
          setError("Unable to fetch jobs right now.")
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
          setSearching(false)
        }
      }
    },
    [platforms, filters]
  )

  const handleSearch = useCallback(() => {
    const nextRole = targetRoleDraft.trim()
    if (!nextRole) return

    skipDebounceRef.current = true
    setActiveTargetRole(nextRole)
    void fetchJobs(nextRole, { forceRefresh: false })
  }, [fetchJobs, targetRoleDraft])

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void fetchJobs(activeTargetRole, { forceRefresh: false })
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [activeTargetRole, fetchJobs])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleClearFilters = () => {
    setFilters({ ...EMPTY_FILTERS, location: defaultLocation })
  }

  const scrollToPlatforms = () => {
    platformRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleLoadMore = () => {
    if (!nextPageToken) return
    void fetchJobs(activeTargetRole, {
      append: true,
      pageToken: nextPageToken,
    })
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner userName={userName} />

      <TargetRoleSearch
        value={targetRoleDraft}
        onChange={setTargetRoleDraft}
        onSearch={handleSearch}
        loading={searching}
      />

      <div ref={platformRef}>
        <PlatformSelector
          selected={platforms}
          onChange={setPlatforms}
          counts={platformCounts}
        />
      </div>

      <JobFiltersPanel
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 space-y-6 xl:order-1">
          <JobList
            jobs={sortedJobs}
            loading={loading}
            searching={searching}
            error={error}
            targetRole={activeTargetRole}
            sortMode={sortMode}
            onSortChange={setSortMode}
            onRetry={() => fetchJobs(activeTargetRole, { forceRefresh: true })}
            onRefresh={() => fetchJobs(activeTargetRole, { forceRefresh: true })}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            onSavedChange={(updated) =>
              setJobs((prev) =>
                prev.map((job) => (job.id === updated.id ? updated : job))
              )
            }
            onToast={setToast}
            onClearFilters={handleClearFilters}
            onChangePlatforms={scrollToPlatforms}
          />
        </div>

        <aside className="order-1 space-y-4 xl:order-2 xl:sticky xl:top-24 xl:self-start">
          <JobsProfileCompleteness profile={profile} />
          <RecentActivity items={activity} />
        </aside>
      </div>

      {toast ? (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 rounded-lg border border-[#2B8A70]/30",
            "bg-[rgba(13,59,46,0.92)] px-4 py-3 text-sm text-white shadow-lg backdrop-blur-md"
          )}
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}

function mergeJobs(existing: JobRecord[], incoming: JobRecord[]): JobRecord[] {
  const map = new Map<string, JobRecord>()
  for (const job of existing) {
    map.set(job.job_url, job)
  }
  for (const job of incoming) {
    map.set(job.job_url, job)
  }
  return Array.from(map.values())
}
