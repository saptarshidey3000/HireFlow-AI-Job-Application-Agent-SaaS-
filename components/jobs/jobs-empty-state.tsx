"use client"

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"

export function JobsEmptyState({
  onClearFilters,
  onChangePlatforms,
  title,
  message,
  showActions = true,
}: {
  onClearFilters: () => void
  onChangePlatforms: () => void
  title?: string
  message?: string
  showActions?: boolean
}) {
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl px-6 py-12 text-center bg-[rgba(36,36,36,0.55)] border border-[rgba(255,255,255,0.06)]">
      <div className="pointer-events-none absolute inset-0 bg-radial from-[rgba(43,138,112,0.08)] to-transparent" />

      <div className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-2xl border border-[#2B8A70]/30 bg-[rgba(13,59,46,0.4)] text-[#3FA98A] shadow-[0_0_20px_rgba(43,138,112,0.15)]">
        <Search className="size-6" />
      </div>

      <h3 className="relative z-10 mt-5 text-xl font-bold tracking-tight text-white">
        {title ?? "No jobs found for this search."}
      </h3>
      <p className="relative z-10 mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#A7A7A7]">
        {message ??
          "Try searching for another target role, adjusting your filters, or enabling more job platforms."}
      </p>

      {showActions && (
        <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="rounded-xl border-[#333333] bg-[#242424] text-xs font-medium text-white hover:border-[#404040]"
          >
            <RotateCcw className="size-3.5" />
            <span>Clear Filters</span>
          </Button>
          <Button
            size="sm"
            onClick={onChangePlatforms}
            className="rounded-xl bg-[#2B8A70] text-xs font-medium text-white hover:bg-[#3FA98A]"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Change Platforms</span>
          </Button>
        </div>
      )}
    </div>
  )
}
