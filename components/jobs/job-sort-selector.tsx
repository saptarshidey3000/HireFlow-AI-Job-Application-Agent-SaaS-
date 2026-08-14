"use client"

import { ChevronDown } from "lucide-react"

import type { JobSortMode } from "@/lib/jobs/types"
import { cn } from "@/lib/utils"

const SORT_OPTIONS: Array<{ value: JobSortMode; label: string }> = [
  { value: "latest", label: "Latest" },
  { value: "best_match", label: "Best Match" },
  { value: "latest_best_match", label: "Latest + Best Match" },
]

export function JobSortSelector({
  value,
  onChange,
  className,
}: {
  value: JobSortMode
  onChange: (value: JobSortMode) => void
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor="job-sort" className="sr-only">
        Sort jobs
      </label>
      <select
        id="job-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as JobSortMode)}
        className={cn(
          "h-10 appearance-none rounded-lg border border-[#333333]",
          "bg-[rgba(13,59,46,0.35)] pl-3 pr-9 text-sm text-white",
          "focus:border-[#2B8A70] focus:outline-none"
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#111]">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#707070]" />
    </div>
  )
}
