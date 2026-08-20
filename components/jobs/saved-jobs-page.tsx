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
            <div className="flex size-9 items-center justify-center rounded-xl border border-[rgba(43,138,112,0.3)] bg-[rgba(13,59,46,0.4)] text-[#3FA98A]">
              <Bookmark className="size-4.5 fill-[#3FA98A]/20" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Saved Jobs
            </h1>
            {totalSaved > 0 && (
              <span className="rounded-full border border-[rgba(43,138,112,0.3)] bg-[rgba(13,59,46,0.35)] px-2.5 py-0.5 text-xs font-semibold text-[#3FA98A]">
                {totalSaved}
              </span>
            )}
          </div>
          <p className="text-sm text-[#A7A7A7]">
            Review, manage, and track all the opportunities you&apos;ve bookmarked.
          </p>
        </div>

        {/* Action Button: Explore Jobs */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard/jobs">
            <Button
              type="button"
              className="h-9.5 gap-2 rounded-xl bg-[#2B8A70] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#3FA98A] hover:shadow-[0_0_16px_rgba(43,138,112,0.3)]"
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
          <div className="glass-card flex items-center gap-3.5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(36,36,36,0.45)] p-4">
            <div className="flex size-10 items-center justify-center rounded-xl border border-[#333333] bg-[#242424] text-[#3FA98A]">
              <Bookmark className="size-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{totalSaved}</div>
              <div className="text-xs text-[#707070]">Total Bookmarked</div>
            </div>
          </div>

          <div className="glass-card flex items-center gap-3.5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(36,36,36,0.45)] p-4">
            <div className="flex size-10 items-center justify-center rounded-xl border border-[rgba(43,138,112,0.3)] bg-[rgba(13,59,46,0.35)] text-[#3FA98A]">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{totalApplied}</div>
              <div className="text-xs text-[#707070]">Applied Opportunities</div>
            </div>
          </div>

          <div className="glass-card flex items-center gap-3.5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(36,36,36,0.45)] p-4">
            <div className="flex size-10 items-center justify-center rounded-xl border border-[#333333] bg-[#242424] text-[#D6A84F]">
              <Clock className="size-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{totalPending}</div>
              <div className="text-xs text-[#707070]">Ready to Apply</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {totalSaved > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(24,24,24,0.6)] p-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#707070]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved jobs by title, company, skill, or location..."
              className="h-9 w-full rounded-xl border border-[#333333] bg-[#1e1e1e] pl-9 pr-8 text-xs text-white placeholder:text-[#707070] focus:border-[#2B8A70] focus:outline-none focus:ring-1 focus:ring-[#2B8A70]"
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
          <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-[#333333] bg-[#1a1a1a] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === "all"
                  ? "bg-[#2B8A70] text-white shadow-sm"
                  : "text-[#A7A7A7] hover:text-white"
              )}
            >
              All ({totalSaved})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("not_applied")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === "not_applied"
                  ? "bg-[#2B8A70] text-white shadow-sm"
                  : "text-[#A7A7A7] hover:text-white"
              )}
            >
              Ready ({totalPending})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("applied")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === "applied"
                  ? "bg-[#2B8A70] text-white shadow-sm"
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
        <div className="flex items-center justify-between rounded-xl border border-[rgba(43,138,112,0.4)] bg-[rgba(13,59,46,0.6)] px-4 py-2.5 text-xs text-white shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#3FA98A]" />
            <span>{toastMessage}</span>
          </div>
          {lastUnsavedJob && (
            <button
              type="button"
              onClick={handleUndoUnsave}
              className="ml-4 font-semibold text-[#3FA98A] underline hover:text-white"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {totalSaved === 0 ? (
        /* Empty State: No jobs saved at all */
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(36,36,36,0.45)] px-6 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-[rgba(43,138,112,0.3)] bg-[rgba(13,59,46,0.35)] text-[#3FA98A] shadow-[0_0_24px_rgba(43,138,112,0.2)]">
            <Bookmark className="size-8 fill-[#3FA98A]/20" />
          </div>
          <h2 className="mt-5 text-xl font-bold tracking-tight text-white">
            No saved jobs yet
          </h2>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-[#A7A7A7]">
            You haven&apos;t bookmarked any opportunities yet. Browse top matches on the Jobs page and click the <strong className="text-white">Save</strong> button on any job card to track them here.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/jobs">
              <Button
                type="button"
                className="gap-2 rounded-xl bg-[#2B8A70] px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#3FA98A] hover:shadow-[0_0_16px_rgba(43,138,112,0.3)]"
              >
                <Briefcase className="size-4" />
                <span>Explore Jobs Now</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Filter Empty State: Search query or filter returned nothing */
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(36,36,36,0.45)] px-6 py-12 text-center">
          <Filter className="size-10 text-[#707070]" />
          <h3 className="mt-3 text-base font-semibold text-white">
            No matching saved jobs
          </h3>
          <p className="mt-1 text-xs text-[#707070]">
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
            className="mt-4 rounded-xl border-[#333333] text-xs text-white hover:bg-[#2B8A70]/20"
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
