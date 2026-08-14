"use client"

import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export function WelcomeBanner({
  userName,
  className,
}: {
  userName: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "glass-card relative overflow-hidden p-6 md:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[rgba(43,138,112,0.12)] blur-3xl" />
      <div className="relative">
        <h1 className="font-display text-2xl text-white md:text-3xl">
          Welcome, {userName}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A7A7A7] md:text-base">
          Here are the opportunities that match your profile.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-[#707070]">
          Search by target role and we&apos;ll match jobs from Google Jobs and
          selected platforms against your resume.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(63,169,138,0.25)] bg-[rgba(13,59,46,0.35)] px-3 py-1.5 text-xs text-[#3FA98A]">
          <Sparkles className="size-3.5" />
          Resume-matched job search
        </div>
      </div>
    </div>
  )
}
