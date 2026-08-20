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
    <div className="glass-card relative overflow-hidden rounded-2xl px-6 py-12 text-center bg-[rgba(36,36,36,0.55)] border border-[rgba(255,255,255,0.06)]">
      <div className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-2xl border border-[rgba(224,90,90,0.3)] bg-[rgba(40,10,10,0.45)] text-[#E05A5A] shadow-[0_0_20px_rgba(224,90,90,0.15)]">
        <AlertTriangle className="size-6" />
      </div>

      <h3 className="relative z-10 mt-5 text-xl font-bold tracking-tight text-white">
        {message ?? "Unable to fetch jobs right now."}
      </h3>
      <p className="relative z-10 mx-auto mt-2 max-w-md text-sm text-[#A7A7A7]">
        We encountered an error connecting to the search provider. Please try again.
      </p>

      <Button
        className="relative z-10 mt-6 rounded-xl bg-[#2B8A70] px-5 text-xs font-medium text-white hover:bg-[#3FA98A]"
        onClick={onRetry}
      >
        <RotateCcw className="size-3.5" />
        <span>Try Again</span>
      </Button>
    </div>
  )
}
