"use client"

import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getFirstName(fullName: string | null): string {
  if (!fullName?.trim()) return "there"
  return fullName.trim().split(/\s+/)[0]
}

export function WelcomeBanner({
  fullName,
  className,
}: {
  fullName: string | null
  className?: string
}) {
  const greeting = getGreeting()
  const name = getFirstName(fullName)

  return (
    <div
      className={cn(
        "glass-card relative overflow-hidden p-6 md:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-[rgba(43,138,112,0.12)] blur-3xl" />
      <div className="relative">
        <p className="text-sm text-[#A7A7A7]">{greeting},</p>
        <h1 className="mt-1 font-display text-2xl text-white md:text-3xl">
          {name}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A7A7A7] md:text-base">
          Here are the opportunities that match your profile.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-[#707070]">
          We found opportunities based on your skills, experience, preferred
          roles, and work preferences.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(63,169,138,0.25)] bg-[rgba(13,59,46,0.35)] px-3 py-1.5 text-xs text-[#3FA98A]">
          <Sparkles className="size-3.5" />
          AI-powered recommendations
        </div>
      </div>
    </div>
  )
}
