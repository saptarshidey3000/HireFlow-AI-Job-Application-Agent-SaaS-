"use client"

import { JobCard, JobCardSkeleton } from "@/components/jobs/job-card"
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state"
import { JobsErrorState } from "@/components/jobs/jobs-error-state"
import type { JobRecord } from "@/lib/jobs/types"

export function JobList({
  jobs,
  loading,
  error,
  onRetry,
  onSavedChange,
  onToast,
  onClearFilters,
  onChangePlatforms,
}: {
  jobs: JobRecord[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onSavedChange: (job: JobRecord) => void
  onToast: (message: string) => void
  onClearFilters: () => void
  onChangePlatforms: () => void
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return <JobsErrorState onRetry={onRetry} />
  }

  if (jobs.length === 0) {
    return (
      <JobsEmptyState
        onClearFilters={onClearFilters}
        onChangePlatforms={onChangePlatforms}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Top Job Matches</h2>
        <p className="text-sm text-[#707070]">{jobs.length} results</p>
      </div>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onSavedChange={onSavedChange}
          onToast={onToast}
        />
      ))}
    </div>
  )
}
