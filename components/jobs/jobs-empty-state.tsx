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
    <div className="relative overflow-hidden rounded-lg border-2 border-[#2d3835] bg-[#181818] px-6 py-12 text-center shadow-[4px_4px_0px_0px_#0d3b2e]">
      <div className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A] shadow-[3px_3px_0px_0px_#000000]">
        <Search className="size-6" />
      </div>

      <h3 className="relative z-10 mt-5 text-xl font-bold uppercase tracking-tight text-white">
        {title ?? "No jobs found for this search."}
      </h3>
      <p className="relative z-10 mx-auto mt-2 max-w-md text-xs font-medium leading-relaxed text-[#A7A7A7]">
        {message ??
          "Try searching for another target role, adjusting your filters, or enabling more job platforms."}
      </p>

      {showActions && (
        <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs font-bold uppercase"
          >
            <RotateCcw className="size-3.5" />
            <span>Clear Filters</span>
          </Button>
          <Button
            size="sm"
            onClick={onChangePlatforms}
            className="text-xs font-bold uppercase"
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Change Platforms</span>
          </Button>
        </div>
      )}
    </div>
  )
}
