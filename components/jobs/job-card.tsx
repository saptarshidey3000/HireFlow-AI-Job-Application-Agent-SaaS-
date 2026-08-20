"use client"

import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  DollarSign,
  ExternalLink,
  MapPin,
  Minus,
  Wifi,
} from "lucide-react"
import { useEffect, useState } from "react"

import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import { Button } from "@/components/ui/button"
import { toggleJobSaved } from "@/lib/actions/jobs"
import { getPlatformConfig, JOB_PLATFORMS } from "@/lib/jobs/platforms"
import { formatPublishedAtText } from "@/lib/jobs/published-date"
import type { JobPlatform, JobRecord } from "@/lib/jobs/types"
import { cn } from "@/lib/utils"

function getPlatformLabel(platform: string): string {
  if (platform === "google_jobs") return "Google Jobs"

  const known = JOB_PLATFORMS.find((item) => item.id === platform)
  if (known) return known.name

  try {
    return getPlatformConfig(platform as JobPlatform).name
  } catch {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }
}

function formatWorkMode(mode: string | null): string {
  if (!mode || mode === "unknown") return "On-site"
  if (mode === "on-campus") return "On Campus"
  if (mode === "onsite") return "On-site"
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function getMatchTier(score: number) {
  if (score >= 80) {
    return {
      label: "Strong Match",
      textColor: "text-[#3FA98A]",
      barGradient: "from-[#2B8A70] to-[#3FA98A]",
    }
  }
  if (score >= 60) {
    return {
      label: "Good Match",
      textColor: "text-[#2B8A70]",
      barGradient: "from-[#145A46] to-[#2B8A70]",
    }
  }
  if (score >= 40) {
    return {
      label: "Potential Match",
      textColor: "text-[#D6A84F]",
      barGradient: "from-[#A67C2E] to-[#D6A84F]",
    }
  }
  return {
    label: "Low Match",
    textColor: "text-[#707070]",
    barGradient: "from-[#404040] to-[#707070]",
  }
}

export function JobCard({
  job,
  onSavedChange,
  onToast,
}: {
  job: JobRecord
  onSavedChange: (job: JobRecord) => void
  onToast: (message: string) => void
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(job.saved_status)
  const [applied, setApplied] = useState(job.applied_status)
  const [showDetails, setShowDetails] = useState(false)
  const [isApplyOpen, setIsApplyOpen] = useState(false)

  useEffect(() => {
    setSaved(job.saved_status)
  }, [job.saved_status])

  useEffect(() => {
    setApplied(job.applied_status)
  }, [job.applied_status])

  const platformName = getPlatformLabel(job.platform)
  const tier = getMatchTier(job.match_score)
  const publishedLabel = formatPublishedAtText(
    job.published_at,
    job.published_at_text
  )

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaving(true)
    const next = !saved
    const result = await toggleJobSaved(job.id, next)
    setSaving(false)

    if (!result.success) {
      onToast("Could not update saved status.")
      return
    }

    setSaved(next)
    onSavedChange(result.job)
    onToast(next ? "Job saved to your bookmarks." : "Job removed from saved.")
  }

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsApplyOpen(true)
  }

  const workModeText = formatWorkMode(job.work_mode)
  const maxVisibleTags = 3
  const visibleTags = job.tags.slice(0, maxVisibleTags)
  const remainingTagsCount = Math.max(0, job.tags.length - maxVisibleTags)

  const hasMatchDetails =
    job.match_details &&
    (job.match_details.matchedSkills.length > 0 ||
      job.match_details.missingSkills.length > 0 ||
      Boolean(job.match_details.matchReason))

  return (
    <article className="group relative overflow-hidden rounded-lg border-2 border-[#2d3835] bg-[#181818] p-4.5 shadow-[4px_4px_0px_0px_#0d3b2e] transition-all duration-120 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-[#3fa98a] hover:shadow-[6px_6px_0px_0px_#145a46] sm:p-5">
      {/* Main horizontal layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Logo + Info */}
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          {/* Company Logo */}
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md border-2 border-[#384843] bg-[#141414] text-[#3FA98A] overflow-hidden shadow-[2px_2px_0px_0px_#000000]">
            {job.company_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.company_logo}
                alt={job.company ?? ""}
                className="size-full object-contain p-1.5"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            ) : (
              <Building2 className="size-5.5 text-[#3FA98A]" />
            )}
          </div>

          {/* Job Details */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Top row: Company name & Platform badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A7A7A7]">
                {job.company || "Direct Employer"}
              </span>
              <span className="inline-flex items-center rounded-[4px] border border-[#384843] bg-[#141414] px-2 py-0.5 text-[11px] font-bold uppercase text-[#CFCFCF]">
                {platformName}
              </span>
            </div>

            {/* Job Title */}
            <h3
              onClick={handleApply}
              className="cursor-pointer text-base sm:text-lg font-bold tracking-tight text-white transition-colors hover:text-[#3FA98A] line-clamp-1"
            >
              {job.title}
            </h3>

            {/* Metadata row with icons */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#A7A7A7]">
              {/* Work Mode */}
              <span className="inline-flex items-center gap-1">
                <Wifi className="size-3 text-[#3FA98A]" />
                {workModeText}
              </span>

              {/* Experience Level */}
              {job.experience_level && (
                <>
                  <span className="text-[#404040]">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="size-3 text-[#707070]" />
                    {job.experience_level}
                  </span>
                </>
              )}

              {/* Location */}
              {job.location && (
                <>
                  <span className="text-[#404040]">·</span>
                  <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="size-3 text-[#707070] shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </span>
                </>
              )}

              {/* Salary */}
              {job.salary && (
                <>
                  <span className="text-[#404040]">·</span>
                  <span className="inline-flex items-center gap-0.5 font-bold text-[#3FA98A]">
                    <DollarSign className="size-3" />
                    {job.salary}
                  </span>
                </>
              )}
            </div>

            {/* Skill Tags */}
            {visibleTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-[4px] border border-[#384843] bg-[#141414] px-2 py-0.5 text-[11px] font-semibold text-[#A7A7A7]"
                  >
                    {tag}
                  </span>
                ))}
                {remainingTagsCount > 0 && (
                  <span className="inline-flex items-center rounded-[4px] border border-[#384843] bg-[#141414] px-1.5 py-0.5 text-[11px] font-semibold text-[#707070]">
                    +{remainingTagsCount}
                  </span>
                )}

                {hasMatchDetails && (
                  <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="ml-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#3FA98A] hover:underline cursor-pointer"
                  >
                    <span>{showDetails ? "Hide breakdown" : "AI match breakdown"}</span>
                    <ChevronDown
                      className={cn(
                        "size-3 transition-transform duration-200",
                        showDetails && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Match score + Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t border-[#333333] sm:border-0">
          {/* Match Score & Progress */}
          <div className="flex flex-col sm:items-end space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-extrabold sm:text-sm uppercase tracking-wide", tier.textColor)}>
                {job.match_score}% Match
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-24 sm:w-28 rounded-[2px] border border-[#384843] bg-[#111111] overflow-hidden">
              <div
                className={cn(
                  "h-full bg-gradient-to-r transition-all duration-300",
                  tier.barGradient
                )}
                style={{ width: `${Math.min(100, Math.max(8, job.match_score))}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <span className={tier.textColor}>{tier.label}</span>
              {publishedLabel && (
                <>
                  <span className="text-[#404040]">·</span>
                  <span className="inline-flex items-center gap-1 text-[#707070]">
                    <Clock3 className="size-3" />
                    {publishedLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={handleSave}
              className={cn(
                "h-8.5 rounded-md px-3 text-xs font-bold uppercase tracking-wider transition-all",
                saved
                  ? "border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A] hover:bg-[#145a46]"
                  : "border-[#384843] bg-[#141414] text-[#A7A7A7] hover:border-[#3fa98a] hover:text-white"
              )}
            >
              {saved ? (
                <BookmarkCheck className="size-3.5 text-[#3FA98A]" />
              ) : (
                <Bookmark className="size-3.5 text-[#707070]" />
              )}
              <span>{saved ? "Saved" : "Save"}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className={cn(
                "h-8.5 rounded-md px-3.5 text-xs font-bold uppercase tracking-wider transition-all",
                applied
                  ? "border-2 border-[#3fa98a] bg-[#0d3b2e] text-[#3FA98A] hover:bg-[#145a46]"
                  : "border-2 border-[#145a46] bg-[#2B8A70] text-white shadow-[2px_2px_0px_0px_#08251e] hover:bg-[#3FA98A]"
              )}
            >
              <span>{applied ? "Applied" : "Apply Now"}</span>
              {applied ? <Check className="size-3.5" /> : <ExternalLink className="size-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Match Breakdown */}
      {showDetails && hasMatchDetails && (
        <div className="mt-4 rounded-md border-2 border-[#2b8a70] bg-[#0d2820] p-3.5 text-xs space-y-2.5 shadow-[3px_3px_0px_0px_#000000]">
          {job.match_details.matchedSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3FA98A]">Matched Skills:</span>
              {job.match_details.matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-[3px] border border-[#2b8a70] bg-[#0d3b2e] px-2 py-0.5 text-[10px] font-bold text-[#3FA98A]"
                >
                  <Check className="size-2.5" />
                  {skill}
                </span>
              ))}
            </div>
          )}

          {job.match_details.missingSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Missing Skills:</span>
              {job.match_details.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-[3px] border border-[#384843] bg-[#141414] px-2 py-0.5 text-[10px] font-bold text-[#707070]"
                >
                  <Minus className="size-2.5" />
                  {skill}
                </span>
              ))}
            </div>
          )}

          {job.match_details.matchReason && (
            <p className="text-[11px] leading-relaxed text-[#A7A7A7]">
              <span className="font-bold text-white">Why this matches: </span>
              {job.match_details.matchReason}
            </p>
          )}
        </div>
      )}

      {/* Apply Options Dialog Modal */}
      <ApplyJobDialog
        job={job}
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        onToast={onToast}
        onAppliedSuccess={() => {
          setApplied(true)
        }}
        onSavedChange={(updatedJob) => {
          setSaved(updatedJob.saved_status)
          onSavedChange(updatedJob)
        }}
      />
    </article>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border-2 border-[#2d3835] bg-[#181818] p-4.5 shadow-[4px_4px_0px_0px_#0d3b2e] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="size-12 rounded-md border-2 border-[#384843] bg-[#242424] shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3.5 w-32 rounded bg-[#2D2D2D]" />
            <div className="h-4.5 w-3/5 rounded bg-[#333333]" />
            <div className="h-3.5 w-2/5 rounded bg-[#2A2A2A]" />
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-16 rounded-[4px] bg-[#2D2D2D]" />
              <div className="h-5 w-20 rounded-[4px] bg-[#2D2D2D]" />
              <div className="h-5 w-14 rounded-[4px] bg-[#2D2D2D]" />
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0">
          <div className="space-y-1.5 sm:text-right">
            <div className="h-4 w-20 rounded bg-[#2D2D2D]" />
            <div className="h-2 w-28 rounded-[2px] bg-[#2D2D2D]" />
          </div>
          <div className="flex gap-2">
            <div className="h-8.5 w-16 rounded-md bg-[#2D2D2D]" />
            <div className="h-8.5 w-24 rounded-md bg-[#2D2D2D]" />
          </div>
        </div>
      </div>
    </div>
  )
}
