"use client"

import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export function WelcomeBanner({
  userName,
  jobsCount,
  className,
}: {
  userName: string
  jobsCount?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "glass-card relative overflow-hidden p-6 md:p-7",
        "bg-[rgba(36,36,36,0.55)] border border-[rgba(255,255,255,0.06)]",
        className
      )}
    >
      {/* Deep emerald ambient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-[rgba(43,138,112,0.14)] blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 size-36 rounded-full bg-[rgba(13,59,46,0.25)] blur-2xl" />

      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          {/* AI Agent Active Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2B8A70]/30 bg-[rgba(13,59,46,0.45)] px-3 py-1 text-xs font-semibold tracking-wide text-[#3FA98A]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FA98A] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#3FA98A]" />
            </span>
            <span className="uppercase tracking-wider text-[10px]">AI AGENT ACTIVE</span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Welcome back, <span className="text-white">{userName}</span>!
          </h1>
          <p className="mt-1.5 text-sm text-[#A7A7A7]">
            {jobsCount !== undefined && jobsCount > 0
              ? `Discovered ${jobsCount} verified opportunities tailored to your profile.`
              : "Discover real-time verified job opportunities matched directly to your profile."}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 sm:flex">
          <Sparkles className="size-4 text-[#3FA98A]" />
          <span className="text-xs font-medium text-[#CFCFCF]">
            AI Profile-Matched Search
          </span>
        </div>
      </div>
    </div>
  )
}
