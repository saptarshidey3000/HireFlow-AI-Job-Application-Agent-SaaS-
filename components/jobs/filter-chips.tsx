"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { JobFilters, JobTypeFilter, WorkModeFilter } from "@/lib/jobs/types"

const JOB_TYPE_LABELS: Record<JobTypeFilter, string> = {
  "full-time": "Full Time",
  "part-time": "Part Time",
  internship: "Internship",
}

const WORK_MODE_LABELS: Record<WorkModeFilter, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  "on-campus": "On Campus",
}

export function FilterChips({
  filters,
  onChange,
  onClear,
}: {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  onClear: () => void
}) {
  const chips: Array<{ key: string; label: string; remove: () => void }> = []

  for (const type of filters.jobTypes) {
    chips.push({
      key: `type-${type}`,
      label: JOB_TYPE_LABELS[type],
      remove: () =>
        onChange({
          ...filters,
          jobTypes: filters.jobTypes.filter((item) => item !== type),
        }),
    })
  }

  for (const mode of filters.workModes) {
    chips.push({
      key: `mode-${mode}`,
      label: WORK_MODE_LABELS[mode],
      remove: () =>
        onChange({
          ...filters,
          workModes: filters.workModes.filter((item) => item !== mode),
        }),
    })
  }

  if (filters.location?.trim()) {
    chips.push({
      key: "location",
      label: filters.location,
      remove: () => onChange({ ...filters, location: "" }),
    })
  }

  if (filters.experienceLevel?.trim()) {
    chips.push({
      key: "experience",
      label: filters.experienceLevel,
      remove: () => onChange({ ...filters, experienceLevel: "" }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-[#707070]">Active filters:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#404040] bg-[rgba(36,36,36,0.55)] px-3 py-1 text-xs text-[#A7A7A7] transition hover:border-[#2B8A70]/50 hover:text-white"
        >
          {chip.label}
          <X className="size-3" />
        </button>
      ))}
      <Button type="button" variant="ghost" size="xs" onClick={onClear}>
        Clear all
      </Button>
    </div>
  )
}
