"use client"

import { Button } from "@/components/ui/button"

export function JobsErrorState({
  onRetry,
  message,
}: {
  onRetry: () => void
  message?: string
}) {
  return (
    <div className="glass-card px-8 py-12 text-center">
      <h3 className="font-display text-2xl text-white">
        {message ?? "Unable to fetch jobs right now."}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-[#A7A7A7]">
        Please try again in a moment.
      </p>
      <Button className="mt-6" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  )
}
