"use client"

import { JobCard, JobCardSkeleton } from "@/components/jobs/job-card"
import { JobSortSelector } from "@/components/jobs/job-sort-selector"
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state"
import { JobsErrorState } from "@/components/jobs/jobs-error-state"
import { Button } from "@/components/ui/button"
import type { JobRecord, JobSortMode } from "@/lib/jobs/types"

export function JobList({
  jobs,
  loading,
  searching,
  error,
  targetRole,
  sortMode,
  onSortChange,
  onRetry,
  onRefresh,
  onLoadMore,
  hasMore,
  onSavedChange,
  onToast,
  onClearFilters,
  onChangePlatforms,
}: {
  jobs: JobRecord[]
  loading: boolean
  searching: boolean
  error: string | null
  targetRole: string
  sortMode: JobSortMode
  onSortChange: (value: JobSortMode) => void
  onRetry: () => void
  onRefresh: () => void
  onLoadMore: () => void
  hasMore: boolean
  onSavedChange: (job: JobRecord) => void
  onToast: (message: string) => void
  onClearFilters: () => void
  onChangePlatforms: () => void
}) {
  const showInitialLoading = loading && jobs.length === 0
  const showEmpty = !loading && !searching && !error && jobs.length === 0

  if (showInitialLoading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#707070]">Searching for matching jobs...</p>
        {Array.from({ length: 4 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error && jobs.length === 0) {
    return <JobsErrorState onRetry={onRetry} message={error} />
  }

  if (showEmpty) {
    return (
      <JobsEmptyState
        onClearFilters={onClearFilters}
        onChangePlatforms={onChangePlatforms}
        message={
          targetRole.trim()
            ? "No jobs found for this search. Try another target role or adjust your filters."
            : "Enter a target role above to search for resume-matched jobs."
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Top Job Matches</h2>
          {targetRole ? (
            <p className="text-sm text-[#707070]">for {targetRole}</p>
          ) : null}
          {searching ? (
            <p className="mt-1 text-sm text-[#3FA98A]">
              Searching for matching jobs...
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <JobSortSelector value={sortMode} onChange={onSortChange} />
          <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
            Refresh Jobs
          </Button>
          <p className="text-sm text-[#707070]">{jobs.length} results</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-[rgba(255,100,100,0.25)] bg-[rgba(40,10,10,0.35)] px-4 py-3 text-sm text-[#ffb4b4]">
          {error}
        </div>
      ) : null}

      {jobs.map((job) => (
        <JobCard
          key={job.id || job.job_url}
          job={job}
          onSavedChange={onSavedChange}
          onToast={onToast}
        />
      ))}

      {searching ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <JobCardSkeleton key={`search-${index}`} />
          ))}
        </div>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button type="button" variant="outline" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  )
}
