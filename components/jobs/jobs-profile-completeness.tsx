"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import type { FullProfile } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

function getChecklistItems(profile: FullProfile) {
  const hasBasicInfo = Boolean(
    profile.profile.full_name?.trim() &&
      (profile.profile.phone?.trim() || profile.profile.location?.trim())
  )
  const hasSummary = Boolean(
    profile.profile.professional_summary &&
      profile.profile.professional_summary.trim().length >= 20
  )
  const hasWorkExp = profile.workExperiences.length > 0
  const hasEducation = profile.education.length > 0
  const hasSkills = profile.skills.length > 0
  // Resume is considered complete if user completed onboarding or has parsed profile data
  const hasResume = Boolean(
    profile.profile.onboarding_completed ||
      profile.workExperiences.length > 0 ||
      profile.skills.length > 0
  )

  return [
    { label: "Basic Information", complete: hasBasicInfo },
    { label: "Professional Summary", complete: hasSummary },
    { label: "Work Experience", complete: hasWorkExp },
    { label: "Education", complete: hasEducation },
    { label: "Skills", complete: hasSkills },
    { label: "Resume", complete: hasResume },
  ]
}

function CircularGauge({ value }: { value: number }) {
  const size = 80
  const strokeWidth = 7
  const normalized = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalized / 100) * circumference
  const center = size / 2

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#3FA98A"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-white">{normalized}%</span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-[#A7A7A7]">
          Complete
        </span>
      </div>
    </div>
  )
}

export function JobsProfileCompleteness({
  profile,
}: {
  profile: FullProfile
}) {
  const checklist = getChecklistItems(profile)
  const completedCount = checklist.filter((item) => item.complete).length
  const percent = Math.round((completedCount / checklist.length) * 100)
  const isAllComplete = percent === 100

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5 md:p-6 bg-[rgba(36,36,36,0.55)] border border-[rgba(255,255,255,0.06)] shadow-lg">
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[rgba(43,138,112,0.12)] blur-2xl" />

      <h3 className="text-sm font-semibold tracking-wide text-white">
        Profile Completeness
      </h3>

      {/* Top section with Circular Gauge + Status Text */}
      <div className="mt-4 flex items-center gap-4">
        <CircularGauge value={percent} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            {isAllComplete ? (
              <>
                <span>Profile complete</span>
                <span>🎉</span>
              </>
            ) : (
              <span>Profile in progress</span>
            )}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#A7A7A7]">
            {isAllComplete
              ? "Your profile is complete and ready for AI applications."
              : "Complete all sections to boost your AI match accuracy."}
          </p>
        </div>
      </div>

      {/* Checklist items */}
      <div className="mt-5 space-y-2.5 border-t border-[#333333] pt-4">
        {checklist.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-xs"
          >
            <span
              className={cn(
                "transition-colors",
                item.complete ? "text-[#D4D4D4]" : "text-[#707070]"
              )}
            >
              {item.label}
            </span>

            {item.complete ? (
              <span className="flex size-4.5 items-center justify-center rounded-full bg-[rgba(63,169,138,0.2)] text-[#3FA98A]">
                <Check className="size-3 stroke-[2.5]" />
              </span>
            ) : (
              <span className="size-2 rounded-full bg-[#404040]" />
            )}
          </div>
        ))}
      </div>

      {/* Improve Profile Button */}
      <div className="mt-5">
        <Link
          href="/dashboard/profile"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#2B8A70] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#3FA98A] hover:shadow-[0_0_15px_rgba(43,138,112,0.3)]"
        >
          <span>Improve Profile</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
