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
          "h-8.5 appearance-none rounded-xl border border-[#333333]",
          "bg-[#242424] pl-8.5 pr-8 text-xs font-medium text-white",
          "focus:border-[#2B8A70] focus:outline-none transition-colors cursor-pointer hover:border-[#404040]"
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1C1C1C] text-white">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-[#707070]" />
    </div>
  )
}
