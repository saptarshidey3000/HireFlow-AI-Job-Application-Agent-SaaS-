"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export function CreditsCard({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <Link
        href="/dashboard/billing"
        aria-label="AI Credits — Manage credits"
        className={cn(
          "flex size-10 items-center justify-center rounded-lg border transition-[border-color,background] duration-150 ease-in-out",
          "border-[rgba(63,169,138,0.18)] bg-[rgba(13,59,46,0.32)]",
          "text-[#3FA98A] hover:border-[rgba(63,169,138,0.35)] hover:bg-[rgba(13,59,46,0.45)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8A70]/30"
        )}
      >
        <Sparkles className="size-4" />
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "rounded-[10px] border p-3 transition-[border-color,background] duration-150 ease-in-out",
        "border-[rgba(63,169,138,0.18)] bg-[rgba(13,59,46,0.32)]"
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 text-[#3FA98A]" />
        <p className="text-xs font-medium text-[#F5F5F5]">AI Credits</p>
      </div>

      <div className="mt-3">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[#333333]"
          role="progressbar"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="AI credits usage"
        >
          <div className="h-full w-0 rounded-full bg-[#3FA98A] transition-all duration-150 ease-in-out" />
        </div>
      </div>

      <Link
        href="/dashboard/billing"
        className="mt-3 inline-flex text-xs text-[#3FA98A] transition-colors duration-150 ease-in-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8A70]/30"
      >
        Manage Credits →
      </Link>
    </div>
  )
}
