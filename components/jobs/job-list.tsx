"use client"

import { Loader2, RefreshCw } from "lucide-react"

import { JobCard, JobCardSkeleton } from "@/components/jobs/job-card"
import { JobSortSelector } from "@/components/jobs/job-sort-selector"
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state"
import { JobsErrorState } from "@/components/jobs/jobs-error-state"
import { Button } from "@/components/ui/button"
import type { JobRecord, JobSortMode } from "@/lib/jobs/types"
import { cn } from "@/lib/utils"

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
  const isRoleEmpty = !targetRole.trim()
  const showEmpty = !loading && !searching && !error && jobs.length === 0

  if (showInitialLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-white">
              Top Job Matches
            </h2>
            <p className="text-xs text-[#707070]">
              Discovering opportunities across platforms...
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error && jobs.length === 0) {
    return <JobsErrorState onRetry={onRetry} message={error} />
  }

  if (showEmpty) {
    if (isRoleEmpty) {
      return (
        <JobsEmptyState
          title="Enter a target role to find matching jobs"
          message="Type a role like Frontend Developer or Software Engineer above to search across top platforms with AI-powered resume matching."
          showActions={false}
          onClearFilters={onClearFilters}
          onChangePlatforms={onChangePlatforms}
        />
      )
    }

    return (
      <JobsEmptyState
        title="No jobs found for this search"
        message="Try adjusting your target role, selecting different job platforms, or modifying your filters."
        showActions={true}
        onClearFilters={onClearFilters}
        onChangePlatforms={onChangePlatforms}
      />
    )
  }

  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white">
              Top Job Matches
            </h2>
            {jobs.length > 0 && (
              <span className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 text-xs font-semibold text-[#A7A7A7]">
                {jobs.length}
              </span>
            )}
          </div>
          {targetRole ? (
            <p className="text-xs text-[#707070]">
              Matching results for <span className="font-medium text-white">&quot;{targetRole}&quot;</span>
            </p>
          ) : (
            <p className="text-xs text-[#707070]">
              AI-ranked by profile compatibility
            </p>
          )}
        </div>

        {/* Header Controls: Sort + Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {searching && (
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3FA98A]">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Updating...</span>
            </div>
          )}

          <JobSortSelector value={sortMode} onChange={onSortChange} />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={searching}
            onClick={onRefresh}
            className="h-8.5 rounded-xl border-[#333333] bg-[#242424] px-3 text-xs font-medium text-[#CFCFCF] transition-all hover:border-[#404040] hover:text-white"
          >
            <RefreshCw
              className={cn("size-3.5", searching && "animate-spin text-[#3FA98A]")}
            />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error banner if search had partial failure */}
      {error && (
        <div className="rounded-xl border border-[rgba(224,90,90,0.3)] bg-[rgba(40,10,10,0.45)] px-4 py-3 text-xs text-[#ffb4b4]">
          {error}
        </div>
      )}

      {/* Job Cards List */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id || job.job_url}
            job={job}
            onSavedChange={onSavedChange}
            onToast={onToast}
          />
        ))}
      </div>

      {/* Searching loading cards if updating */}
      {searching && jobs.length > 0 && (
        <div className="space-y-3 pt-2">
          <JobCardSkeleton />
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={searching}
            onClick={onLoadMore}
            className="h-10 rounded-xl border-[#333333] bg-[#242424] px-6 text-xs font-semibold text-white transition-all hover:border-[#2B8A70] hover:bg-[rgba(13,59,46,0.3)]"
          >
            {searching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span>Load More Opportunities</span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
