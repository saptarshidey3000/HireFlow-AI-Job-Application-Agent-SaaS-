"use client"

import { RotateCcw, X } from "lucide-react"

import type { JobFilters, JobTypeFilter, WorkModeFilter } from "@/lib/jobs/types"

const JOB_TYPE_LABELS: Record<JobTypeFilter, string> = {
  "full-time": "Full Time",
  "part-time": "Part Time",
  internship: "Internship",
  contract: "Contract",
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
      label: JOB_TYPE_LABELS[type] ?? type,
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
      label: WORK_MODE_LABELS[mode] ?? mode,
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
      label: `Location: ${filters.location}`,
      remove: () => onChange({ ...filters, location: "" }),
    })
  }

  if (filters.experienceLevel?.trim()) {
    chips.push({
      key: "experience",
      label: `Exp: ${filters.experienceLevel}`,
      remove: () => onChange({ ...filters, experienceLevel: "" }),
    })
  }

  if (filters.salaryMin?.trim()) {
    chips.push({
      key: "salary",
      label: `Salary: ${filters.salaryMin}`,
      remove: () => onChange({ ...filters, salaryMin: "" }),
    })
  }

  if (filters.postedWithin?.trim()) {
    chips.push({
      key: "posted",
      label: `Posted: ${filters.postedWithin}`,
      remove: () => onChange({ ...filters, postedWithin: "" }),
    })
  }

  if (filters.skills && filters.skills.length > 0) {
    for (const skill of filters.skills) {
      chips.push({
        key: `skill-${skill}`,
        label: `Skill: ${skill}`,
        remove: () =>
          onChange({
            ...filters,
            skills: filters.skills?.filter((s) => s !== skill),
          }),
      })
    }
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-xs font-medium text-[#707070]">Active filters:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="group inline-flex items-center gap-1.5 rounded-full border border-[#2B8A70]/30 bg-[rgba(13,59,46,0.35)] px-3 py-1 text-xs font-medium text-[#3FA98A] transition-all hover:border-[#E05A5A]/50 hover:bg-[rgba(224,90,90,0.15)] hover:text-[#ff9999]"
        >
          <span>{chip.label}</span>
          <X className="size-3 transition-transform group-hover:scale-110" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 text-xs font-medium text-[#A7A7A7] transition-colors hover:text-white"
      >
        <RotateCcw className="size-3" />
        <span>Clear all</span>
      </button>
    </div>
  )
}
