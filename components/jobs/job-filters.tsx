"use client"

import {
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  DollarSign,
  MapPin,
  SlidersHorizontal,
} from "lucide-react"
import { useState } from "react"

import { FilterChips } from "@/components/jobs/filter-chips"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { JobFilters, JobTypeFilter, WorkModeFilter } from "@/lib/jobs/types"

const JOB_TYPE_OPTIONS: { id: JobTypeFilter; label: string }[] = [
  { id: "full-time", label: "Full Time" },
  { id: "part-time", label: "Part Time" },
  { id: "internship", label: "Internship" },
]

const WORK_MODE_OPTIONS: { id: WorkModeFilter; label: string }[] = [
  { id: "remote", label: "Remote" },
  { id: "hybrid", label: "Hybrid" },
  { id: "on-campus", label: "On Campus" },
]

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-xs font-bold transition-all duration-120 cursor-pointer select-none",
        active
          ? "border-2 border-[#2b8a70] bg-[#0d3b2e] text-white shadow-[2px_2px_0px_0px_#000000]"
          : "border-2 border-[#384843] bg-[#141414] text-[#A7A7A7] hover:border-[#3fa98a] hover:bg-[#242424] hover:text-white hover:shadow-[2px_2px_0px_0px_#000000]"
      )}
    >
      {active && <Check className="size-3 text-[#3FA98A] stroke-[3]" />}
      <span>{label}</span>
    </button>
  )
}

function FilterGroups({
  filters,
  onChange,
  showMore,
  onToggleMore,
}: {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  showMore: boolean
  onToggleMore: () => void
}) {
  const toggleJobType = (type: JobTypeFilter) => {
    const next = filters.jobTypes.includes(type)
      ? filters.jobTypes.filter((item) => item !== type)
      : [...filters.jobTypes, type]
    onChange({ ...filters, jobTypes: next })
  }

  const toggleWorkMode = (mode: WorkModeFilter) => {
    const next = filters.workModes.includes(mode)
      ? filters.workModes.filter((item) => item !== mode)
      : [...filters.workModes, mode]
    onChange({ ...filters, workModes: next })
  }

  return (
    <div className="space-y-4 rounded-lg border-2 border-[#2d3835] bg-[#181818] p-4 shadow-[4px_4px_0px_0px_#0d3b2e] md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Job Type Section */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-[#707070]">
            Job Type:
          </span>
          {JOB_TYPE_OPTIONS.map((option) => (
            <FilterPill
              key={option.id}
              label={option.label}
              active={filters.jobTypes.includes(option.id)}
              onClick={() => toggleJobType(option.id)}
            />
          ))}
        </div>

        <div className="hidden h-5 w-px bg-[#333333] md:block" />

        {/* Work Mode Section */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-[#707070]">
            Work Mode:
          </span>
          {WORK_MODE_OPTIONS.map((option) => (
            <FilterPill
              key={option.id}
              label={option.label}
              active={filters.workModes.includes(option.id)}
              onClick={() => toggleWorkMode(option.id)}
            />
          ))}
        </div>

        {/* More Filters toggle button */}
        <button
          type="button"
          onClick={onToggleMore}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer self-start md:self-auto",
            showMore
              ? "border-[#2B8A70] bg-[rgba(13,59,46,0.35)] text-white"
              : "border-[#333333] bg-[#242424] text-[#A7A7A7] hover:border-[#404040] hover:text-white"
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          <span>More Filters</span>
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              showMore && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Expanded More Filters Panel */}
      {showMore && (
        <div className="grid gap-3.5 border-t border-[#333333] pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#A7A7A7]">
              <MapPin className="size-3 text-[#3FA98A]" />
              <span>Location</span>
            </label>
            <Input
              value={filters.location ?? ""}
              onChange={(e) =>
                onChange({ ...filters, location: e.target.value })
              }
              placeholder="e.g. Remote, India, US"
              className="h-9 border-[#333333] bg-[#1E1E1E] text-xs text-white placeholder:text-[#606060] focus:border-[#2B8A70]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#A7A7A7]">
              <Briefcase className="size-3 text-[#3FA98A]" />
              <span>Experience Level</span>
            </label>
            <Input
              value={filters.experienceLevel ?? ""}
              onChange={(e) =>
                onChange({ ...filters, experienceLevel: e.target.value })
              }
              placeholder="e.g. Entry, Mid, Senior"
              className="h-9 border-[#333333] bg-[#1E1E1E] text-xs text-white placeholder:text-[#606060] focus:border-[#2B8A70]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#A7A7A7]">
              <DollarSign className="size-3 text-[#3FA98A]" />
              <span>Salary Minimum</span>
            </label>
            <Input
              value={filters.salaryMin ?? ""}
              onChange={(e) =>
                onChange({ ...filters, salaryMin: e.target.value })
              }
              placeholder="e.g. 100k, $80,000"
              className="h-9 border-[#333333] bg-[#1E1E1E] text-xs text-white placeholder:text-[#606060] focus:border-[#2B8A70]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#A7A7A7]">
              <Calendar className="size-3 text-[#3FA98A]" />
              <span>Posted Date</span>
            </label>
            <Input
              value={filters.postedWithin ?? ""}
              onChange={(e) =>
                onChange({ ...filters, postedWithin: e.target.value })
              }
              placeholder="e.g. Past 24h, 7 days"
              className="h-9 border-[#333333] bg-[#1E1E1E] text-xs text-white placeholder:text-[#606060] focus:border-[#2B8A70]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function JobFiltersPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  onClear: () => void
}) {
  const [showMore, setShowMore] = useState(false)
  const activeCount =
    filters.jobTypes.length +
    filters.workModes.length +
    (filters.location ? 1 : 0) +
    (filters.experienceLevel ? 1 : 0) +
    (filters.salaryMin ? 1 : 0) +
    (filters.postedWithin ? 1 : 0) +
    (filters.skills?.length ?? 0)

  return (
    <div className="space-y-3">
      {/* Desktop / Tablet Filters */}
      <div className="hidden sm:block">
        <FilterGroups
          filters={filters}
          onChange={onChange}
          showMore={showMore}
          onToggleMore={() => setShowMore((prev) => !prev)}
        />
      </div>

      {/* Mobile Drawer */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger
            className="flex w-full items-center justify-between rounded-xl border border-[#333333] bg-[#242424] px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-[#2B8A70]"
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-[#3FA98A]" />
              <span>Filters</span>
            </span>
            {activeCount > 0 && (
              <span className="rounded-full bg-[#2B8A70] px-2 py-0.5 text-xs font-semibold text-white">
                {activeCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] overflow-y-auto border-t border-[#333333] bg-[#1C1C1C] text-white"
          >
            <SheetHeader>
              <SheetTitle className="text-white">Filter Opportunities</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6 pt-2">
              <FilterGroups
                filters={filters}
                onChange={onChange}
                showMore={true}
                onToggleMore={() => {}}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <FilterChips filters={filters} onChange={onChange} onClear={onClear} />
    </div>
  )
}
