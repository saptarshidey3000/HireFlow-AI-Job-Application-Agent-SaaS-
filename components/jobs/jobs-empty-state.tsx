"use client"

import { Button } from "@/components/ui/button"

export function JobsEmptyState({
  onClearFilters,
  onChangePlatforms,
}: {
  onClearFilters: () => void
  onChangePlatforms: () => void
}) {
  return (
    <div className="glass-card px-8 py-12 text-center">
      <h3 className="font-display text-2xl text-white">No matching jobs yet.</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#A7A7A7]">
        Try changing your filters or selecting another job platform.
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
