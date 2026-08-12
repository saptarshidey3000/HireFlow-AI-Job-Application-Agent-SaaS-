"use client"

import { ChevronDown, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

import { FilterChips } from "@/components/jobs/filter-chips"
import { Button } from "@/components/ui/button"
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

function FilterToggle({
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
        "rounded-full border px-3.5 py-1.5 text-sm transition-all",
        active
          ? "border-[#2B8A70] bg-[rgba(13,59,46,0.55)] text-white"
          : "border-[#404040] bg-[rgba(36,36,36,0.55)] text-[#A7A7A7] hover:border-[#2B8A70]/50 hover:text-white"
      )}
    >
      {active ? "✓ " : ""}
      {label}
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
    <div className="glass-card space-y-5 p-5">
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Job Type</p>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPE_OPTIONS.map((option) => (
            <FilterToggle
              key={option.id}
              label={option.label}
              active={filters.jobTypes.includes(option.id)}
              onClick={() => toggleJobType(option.id)}
            />
          ))}
        </div>
        {filters.jobTypes.length === 0 ? (
          <p className="text-xs text-[#707070]">All job types</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Work Mode</p>
        <div className="flex flex-wrap gap-2">
          {WORK_MODE_OPTIONS.map((option) => (
            <FilterToggle
              key={option.id}
              label={option.label}
              active={filters.workModes.includes(option.id)}
              onClick={() => toggleWorkMode(option.id)}
            />
          ))}
        </div>
        {filters.workModes.length === 0 ? (
          <p className="text-xs text-[#707070]">All work modes</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-[#A7A7A7] hover:text-white"
        onClick={onToggleMore}
      >
        More Filters
        <ChevronDown
          className={cn("size-4 transition-transform", showMore && "rotate-180")}
        />
      </Button>

      {showMore ? (
        <div className="grid gap-4 border-t border-[#333333] pt-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-[#A7A7A7]">Location</label>
            <Input
              value={filters.location ?? ""}
              onChange={(e) =>
                onChange({ ...filters, location: e.target.value })
              }
              placeholder="City or region"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#A7A7A7]">Experience Level</label>
            <Input
              value={filters.experienceLevel ?? ""}
              onChange={(e) =>
                onChange({ ...filters, experienceLevel: e.target.value })
              }
              placeholder="Entry, Mid, Senior"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#A7A7A7]">Salary Range</label>
            <Input
              value={filters.salaryMin ?? ""}
              onChange={(e) =>
                onChange({ ...filters, salaryMin: e.target.value })
              }
              placeholder="e.g. 80k+"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#A7A7A7]">Posted Date</label>
            <Input
              value={filters.postedWithin ?? ""}
              onChange={(e) =>
                onChange({ ...filters, postedWithin: e.target.value })
              }
              placeholder="Past week, month"
            />
          </div>
        </div>
      ) : null}
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
    (filters.postedWithin ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="hidden lg:block">
        <FilterGroups
          filters={filters}
          onChange={onChange}
          showMore={showMore}
          onToggleMore={() => setShowMore((prev) => !prev)}
        />
      </div>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger>
            <Button variant="outline" className="w-full justify-between">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                Filters{activeCount > 0 ? ` (${activeCount})` : ""}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-6 pb-6">
              <FilterGroups
                filters={filters}
                onChange={onChange}
                showMore={showMore}
                onToggleMore={() => setShowMore((prev) => !prev)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <FilterChips filters={filters} onChange={onChange} onClear={onClear} />
    </div>
  )
}
