"use client"

import { ArrowUpDown, ChevronDown } from "lucide-react"

import type { JobSortMode } from "@/lib/jobs/types"
import { cn } from "@/lib/utils"

const SORT_OPTIONS: Array<{ value: JobSortMode; label: string }> = [
  { value: "latest", label: "Latest" },
  { value: "best_match", label: "Best Match" },
  { value: "latest_best_match", label: "Latest + Match" },
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
    <div className={cn("relative inline-flex items-center", className)}>
      <label htmlFor="job-sort" className="sr-only">
        Sort jobs
      </label>
      <ArrowUpDown className="pointer-events-none absolute left-3 size-3.5 text-[#3FA98A]" />
      <select
        id="job-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as JobSortMode)}
        className={cn(
          "h-8.5 appearance-none rounded-md border-2 border-[#384843]",
          "bg-[#141414] pl-8.5 pr-8 text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_#000000]",
          "focus:border-[#3fa98a] focus:outline-none transition-colors cursor-pointer hover:border-[#3fa98a]"
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#141414] text-white">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-[#707070]" />
    </div>
  )
}
