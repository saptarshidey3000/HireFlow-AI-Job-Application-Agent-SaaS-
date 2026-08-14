"use client"

import { Button } from "@/components/ui/button"

export function JobsEmptyState({
  onClearFilters,
  onChangePlatforms,
  message,
}: {
  onClearFilters: () => void
  onChangePlatforms: () => void
  message?: string
}) {
  return (
    <div className="glass-card px-8 py-12 text-center">
      <h3 className="font-display text-2xl text-white">
        No jobs found for this search.
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#A7A7A7]">
        {message ??
          "Try another target role, adjust your filters, or select different job platforms."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
        <Button onClick={onChangePlatforms}>Change Platforms</Button>
      </div>
    </div>
  )
}
