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
import type {
  JobActivityItem,
  JobFilters,
  JobPlatform,
  JobRecord,
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
}: {
  profile: FullProfile
  activity: JobActivityItem[]
}) {
  const defaultRole = useMemo(() => inferTargetRole(profile), [profile])

  const [targetRoleDraft, setTargetRoleDraft] = useState(defaultRole)
  const [activeTargetRole, setActiveTargetRole] = useState(defaultRole)
  const [platforms, setPlatforms] = useState<JobPlatform[]>(DEFAULT_PLATFORMS)
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS)
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const platformRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipDebounceRef = useRef(false)

  const platformCounts = useMemo(() => {
    const counts: Partial<Record<JobPlatform, number>> = {}
    for (const job of jobs) {
      const platform = job.platform as JobPlatform
      counts[platform] = (counts[platform] ?? 0) + 1
    }
    return counts
  }, [jobs])

  const fetchJobs = useCallback(
    async (targetRole: string, forceRefresh = false) => {
      const trimmedRole = targetRole.trim()
      if (!trimmedRole) {
        setJobs([])
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/jobs/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetRole: trimmedRole,
            platforms,
            filters,
            forceRefresh,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(
            data.error === "JOB_SEARCH_UNAVAILABLE"
              ? "We couldn't load jobs right now."
              : "We couldn't load jobs right now."
          )
          setJobs([])
          return
        }

        setJobs(data.jobs ?? [])
      } catch {
        setError("We couldn't load jobs right now.")
        setJobs([])
      } finally {
        setLoading(false)
      }
    },
    [platforms, filters]
  )

  const handleSearch = useCallback(() => {
    const nextRole = targetRoleDraft.trim()
    if (!nextRole) return

    skipDebounceRef.current = true
    setActiveTargetRole(nextRole)
    void fetchJobs(nextRole, false)
  }, [fetchJobs, targetRoleDraft])

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void fetchJobs(activeTargetRole, false)
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
    setFilters(EMPTY_FILTERS)
  }

  const scrollToPlatforms = () => {
    platformRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="space-y-6">
      <WelcomeBanner fullName={profile.profile.full_name} />

      <TargetRoleSearch
        value={targetRoleDraft}
        onChange={setTargetRoleDraft}
        onSearch={handleSearch}
        loading={loading}
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
            jobs={jobs}
            loading={loading}
            error={error}
            targetRole={activeTargetRole}
            onRetry={() => fetchJobs(activeTargetRole, true)}
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
