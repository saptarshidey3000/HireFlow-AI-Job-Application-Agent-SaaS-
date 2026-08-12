"use client"

import { Bookmark, BookmarkCheck, Building2, ExternalLink, MapPin } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toggleJobSaved } from "@/lib/actions/jobs"
import { getPlatformConfig, JOB_PLATFORMS } from "@/lib/jobs/platforms"
import type { JobPlatform, JobRecord } from "@/lib/jobs/types"

function getPlatformLabel(platform: string): string {
  const known = JOB_PLATFORMS.find((item) => item.id === platform)
  if (known) return known.name

  try {
    return getPlatformConfig(platform as JobPlatform).name
  } catch {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }
}

function formatJobType(type: string | null): string {
  if (!type || type === "unknown") return "Role"
  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatWorkMode(mode: string | null): string {
  if (!mode || mode === "unknown") return ""
  if (mode === "on-campus") return "On Campus"
  if (mode === "onsite") return "Onsite"
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function MatchBar({ score }: { score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#3FA98A]">{score}% Match</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#333333]">
        <div
          className="h-full rounded-full bg-[#3FA98A] transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
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
  const platformName = getPlatformLabel(job.platform)

  const handleSave = async () => {
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
    onToast(next ? "Job saved." : "Job removed from saved jobs.")
  }

  const handleApply = () => {
    window.open(job.job_url, "_blank", "noopener,noreferrer")
  }

  const locationLine = [job.location, formatWorkMode(job.work_mode)]
    .filter(Boolean)
    .join(" · ")

  return (
    <article className="glass-card p-5 transition hover:border-[rgba(63,169,138,0.18)]">
      <div className="flex gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(13,59,46,0.35)] text-[#3FA98A]">
          {job.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company_logo}
              alt=""
              className="size-8 rounded-md object-cover"
            />
          ) : (
            <Building2 className="size-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-medium text-white">{job.title}</h3>
          <p className="text-sm text-[#A7A7A7]">{job.company ?? "Company"}</p>

          {locationLine ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#707070]">
              <MapPin className="size-3.5 shrink-0" />
              {locationLine}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#A7A7A7]">
            {job.salary ? <span>{job.salary}</span> : null}
            {job.salary && job.job_type ? <span>·</span> : null}
            {job.job_type ? <span>{formatJobType(job.job_type)}</span> : null}
            {job.experience_level ? (
              <>
                <span>·</span>
                <span>{job.experience_level}</span>
              </>
            ) : null}
          </div>

          {job.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-4">
            <MatchBar score={job.match_score} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Badge>{platformName}</Badge>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={handleSave}
              >
                {saved ? (
                  <BookmarkCheck className="size-4 text-[#3FA98A]" />
                ) : (
                  <Bookmark className="size-4" />
                )}
                {saved ? "Saved" : "Save"}
              </Button>
              <Button type="button" size="sm" onClick={handleApply}>
                Apply Now
                <ExternalLink className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="glass-card animate-pulse p-5">
      <div className="flex gap-4">
        <div className="size-12 rounded-xl bg-[#333333]" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-2/3 rounded bg-[#333333]" />
          <div className="h-4 w-1/3 rounded bg-[#2D2D2D]" />
          <div className="h-4 w-1/2 rounded bg-[#2D2D2D]" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-16 rounded-full bg-[#2D2D2D]" />
            <div className="h-6 w-20 rounded-full bg-[#2D2D2D]" />
            <div className="h-6 w-14 rounded-full bg-[#2D2D2D]" />
          </div>
          <div className="h-2 w-full rounded-full bg-[#333333]" />
          <div className="flex justify-between pt-2">
            <div className="h-6 w-24 rounded-full bg-[#2D2D2D]" />
            <div className="h-8 w-40 rounded bg-[#2D2D2D]" />
          </div>
        </div>
      </div>
    </div>
  )
}
