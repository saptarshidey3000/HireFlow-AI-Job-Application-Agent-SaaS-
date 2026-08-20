"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  X,
} from "lucide-react"

import { JobCard } from "@/components/jobs/job-card"
import { Button } from "@/components/ui/button"
import { toggleJobSaved } from "@/lib/actions/jobs"
import type { JobRecord } from "@/lib/jobs/types"
import { cn } from "@/lib/utils"

type FilterTab = "all" | "not_applied" | "applied"

export function SavedJobsPageClient({
  initialJobs,
}: {
  initialJobs: JobRecord[]
}) {
  const [jobs, setJobs] = useState<JobRecord[]>(initialJobs)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [lastUnsavedJob, setLastUnsavedJob] = useState<JobRecord | null>(null)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current))
    }, 4000)
  }

  const handleSavedChange = (updatedJob: JobRecord) => {
    if (!updatedJob.saved_status) {
      // Optimistically remove from saved jobs list
      setLastUnsavedJob(updatedJob)
      setJobs((prev) => prev.filter((j) => j.id !== updatedJob.id))
    } else {
      setJobs((prev) => {
        const exists = prev.some((j) => j.id === updatedJob.id)
        if (exists) {
          return prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        }
        return [updatedJob, ...prev]
      })
    }
  }

  const handleUndoUnsave = async () => {
    if (!lastUnsavedJob) return
    const jobToRestore = lastUnsavedJob
    setLastUnsavedJob(null)

    const result = await toggleJobSaved(jobToRestore.id, true)
    if (result.success) {
      setJobs((prev) => [result.job, ...prev])
      showToast("Restored job to your saved list.")
    } else {
      showToast("Could not restore saved job.")
    }
  }

  // Calculate quick stats
  const totalSaved = jobs.length
  const totalApplied = useMemo(
    () => jobs.filter((j) => j.applied_status).length,
    [jobs]
  )
  const totalPending = totalSaved - totalApplied

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status tab filter
      if (activeTab === "applied" && !job.applied_status) return false
      if (activeTab === "not_applied" && job.applied_status) return false

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const titleMatch = job.title.toLowerCase().includes(query)
        const companyMatch = job.company?.toLowerCase().includes(query) ?? false
        const locationMatch = job.location?.toLowerCase().includes(query) ?? false
        const tagMatch = job.tags.some((t) => t.toLowerCase().includes(query))
        const platformMatch = job.platform.toLowerCase().includes(query)

        if (!titleMatch && !companyMatch && !locationMatch && !tagMatch && !platformMatch) {
          return false
        }
      }

      return true
    })
  }, [jobs, activeTab, searchQuery])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A] shadow-[2px_2px_0px_0px_#000000]">
              <Bookmark className="size-4.5 fill-[#3FA98A]/20" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
              Saved Jobs
            </h1>
            {totalSaved > 0 && (
              <span className="rounded-[4px] border-2 border-[#2b8a70] bg-[#0d3b2e] px-2.5 py-0.5 text-xs font-bold text-[#3FA98A] shadow-[1px_1px_0px_0px_#000000]">
                {totalSaved}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-[#A7A7A7]">
            Review, manage, and track all the opportunities you&apos;ve bookmarked.
          </p>
        </div>

        {/* Action Button: Explore Jobs */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard/jobs">
            <Button
              type="button"
              className="h-9.5 gap-2 px-4 text-xs font-bold uppercase tracking-wider"
            >
              <Briefcase className="size-4" />
              <span>Explore More Jobs</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      {totalSaved > 0 && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div className="flex items-center gap-3.5 rounded-lg border-2 border-[#2d3835] bg-[#181818] p-4 shadow-[4px_4px_0px_0px_#0d3b2e]">
            <div className="flex size-10 items-center justify-center rounded-md border-2 border-[#384843] bg-[#141414] text-[#3FA98A]">
              <Bookmark className="size-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{totalSaved}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#707070]">Total Bookmarked</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-lg border-2 border-[#2d3835] bg-[#181818] p-4 shadow-[4px_4px_0px_0px_#0d3b2e]">
            <div className="flex size-10 items-center justify-center rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A]">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{totalApplied}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#707070]">Applied Opportunities</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-lg border-2 border-[#2d3835] bg-[#181818] p-4 shadow-[4px_4px_0px_0px_#0d3b2e]">
            <div className="flex size-10 items-center justify-center rounded-md border-2 border-[#384843] bg-[#141414] text-[#D6A84F]">
              <Clock className="size-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{totalPending}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#707070]">Ready to Apply</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {totalSaved > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border-2 border-[#2d3835] bg-[#181818] p-3 shadow-[3px_3px_0px_0px_#000000] sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#707070]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved jobs by title, company, skill, or location..."
              className="h-9.5 w-full rounded-md border-2 border-[#384843] bg-[#141414] pl-9 pr-8 text-xs font-medium text-white placeholder:text-[#707070] shadow-[2px_2px_0px_0px_#000000] focus:border-[#3fa98a] focus:shadow-[3px_3px_0px_0px_#0d3b2e] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707070] hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 self-start rounded-md border-2 border-[#384843] bg-[#141414] p-1 sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-[4px] px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "all"
                  ? "border border-[#2b8a70] bg-[#0d3b2e] text-white shadow-[1px_1px_0px_0px_#000000]"
                  : "text-[#A7A7A7] hover:text-white"
              )}
            >
              All ({totalSaved})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("not_applied")}
              className={cn(
                "rounded-[4px] px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "not_applied"
                  ? "border border-[#2b8a70] bg-[#0d3b2e] text-white shadow-[1px_1px_0px_0px_#000000]"
                  : "text-[#A7A7A7] hover:text-white"
              )}
            >
              Ready ({totalPending})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("applied")}
              className={cn(
                "rounded-[4px] px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "applied"
                  ? "border border-[#2b8a70] bg-[#0d3b2e] text-white shadow-[1px_1px_0px_0px_#000000]"
                  : "text-[#A7A7A7] hover:text-white"
              )}
            >
              Applied ({totalApplied})
            </button>
          </div>
        </div>
      )}

      {/* Toast Banner */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] px-4 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#3FA98A]" />
            <span>{toastMessage}</span>
          </div>
          {lastUnsavedJob && (
            <button
              type="button"
              onClick={handleUndoUnsave}
              className="ml-4 font-bold text-[#3FA98A] underline hover:text-white cursor-pointer"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {totalSaved === 0 ? (
        /* Empty State: No jobs saved at all */
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-[#2d3835] bg-[#181818] px-6 py-16 text-center shadow-[4px_4px_0px_0px_#0d3b2e]">
          <div className="flex size-16 items-center justify-center rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A] shadow-[3px_3px_0px_0px_#000000]">
            <Bookmark className="size-8 fill-[#3FA98A]/20" />
          </div>
          <h2 className="mt-5 text-xl font-bold uppercase tracking-tight text-white">
            No saved jobs yet
          </h2>
          <p className="mt-2 max-w-md text-xs font-medium leading-relaxed text-[#A7A7A7]">
            You haven&apos;t bookmarked any opportunities yet. Browse top matches on the Jobs page and click the <strong className="text-white">Save</strong> button on any job card to track them here.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/jobs">
              <Button
                type="button"
                className="gap-2 px-5 text-xs font-bold uppercase tracking-wider"
              >
                <Briefcase className="size-4" />
                <span>Explore Jobs Now</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Filter Empty State: Search query or filter returned nothing */
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-[#2d3835] bg-[#181818] px-6 py-12 text-center shadow-[4px_4px_0px_0px_#0d3b2e]">
          <Filter className="size-10 text-[#707070]" />
          <h3 className="mt-3 text-base font-bold uppercase text-white">
            No matching saved jobs
          </h3>
          <p className="mt-1 text-xs font-medium text-[#707070]">
            No bookmarked jobs match your search or selected filter.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setActiveTab("all")
            }}
            className="mt-4 text-xs font-bold uppercase"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        /* Saved Jobs Cards List (reusing JobCard) */
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSavedChange={handleSavedChange}
              onToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  )
}
