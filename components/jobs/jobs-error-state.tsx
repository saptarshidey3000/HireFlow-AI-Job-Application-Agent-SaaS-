"use client"

import { AlertTriangle, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export function JobsErrorState({
  onRetry,
  message,
}: {
  onRetry: () => void
  message?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-[#2d3835] bg-[#181818] px-6 py-12 text-center shadow-[4px_4px_0px_0px_#0d3b2e]">
      <div className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-md border-2 border-[#E05A5A] bg-[#381414] text-[#E05A5A] shadow-[3px_3px_0px_0px_#000000]">
        <AlertTriangle className="size-6" />
      </div>

      <h3 className="relative z-10 mt-5 text-xl font-bold uppercase tracking-tight text-white">
        {message ?? "Unable to fetch jobs right now."}
      </h3>
      <p className="relative z-10 mx-auto mt-2 max-w-md text-xs font-medium text-[#A7A7A7]">
        We encountered an error connecting to the search provider. Please try again.
      </p>

      <Button
        className="relative z-10 mt-6 px-5 text-xs font-bold uppercase tracking-wider text-white"
        onClick={onRetry}
      >
        <RotateCcw className="size-3.5" />
        <span>Try Again</span>
      </Button>
    </div>
  )
}
