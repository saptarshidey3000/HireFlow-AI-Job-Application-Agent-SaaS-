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
        "relative overflow-hidden rounded-lg border-2 border-[#2d3835] bg-[#141816] p-6 shadow-[5px_5px_0px_0px_#0d3b2e] md:p-7",
        className
      )}
    >
      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          {/* AI Agent Active Badge */}
          <div className="inline-flex items-center gap-2 rounded-[4px] border-2 border-[#2b8a70] bg-[#0d3b2e] px-2.5 py-1 text-xs font-bold text-[#3FA98A] shadow-[2px_2px_0px_0px_#000000]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FA98A] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#3FA98A]" />
            </span>
            <span className="uppercase tracking-wider text-[10px]">AI AGENT ACTIVE</span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white uppercase md:text-3xl">
            Welcome back, <span className="text-[#3fa98a]">{userName}</span>!
          </h1>
          <p className="mt-1.5 text-sm font-medium text-[#A7A7A7]">
            {jobsCount !== undefined && jobsCount > 0
              ? `Discovered ${jobsCount} verified opportunities tailored to your profile.`
              : "Discover real-time verified job opportunities matched directly to your profile."}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-md border-2 border-[#384843] bg-[#181818] px-4 py-2.5 shadow-[3px_3px_0px_0px_#000000] sm:flex">
          <Sparkles className="size-4 text-[#3FA98A]" />
          <span className="text-xs font-bold uppercase tracking-wide text-[#E5E5E5]">
            AI Profile Matched
          </span>
        </div>
      </div>
    </div>
  )
}
