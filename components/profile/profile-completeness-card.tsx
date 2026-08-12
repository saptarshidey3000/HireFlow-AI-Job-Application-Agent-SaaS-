"use client"

import { CircularProgress } from "@/components/profile/circular-progress"
import { cn } from "@/lib/utils"
import {
  calculateProfileCompleteness,
  type ProfileCompletenessResult,
  type ProfileSectionCompleteness,
} from "@/lib/profile/completeness"
import type { FullProfile } from "@/lib/supabase/database.types"

function getProgressMessage(percent: number): string {
  if (percent >= 90) return "Your profile is nearly complete."
  if (percent >= 70) return "Great progress — a few sections left."
  if (percent >= 40) return "Keep going — fill in more sections."
  return "Get started by completing your core sections."
}

export function ProfileCompletenessCard({
  profile,
  completeness: completenessProp,
  className,
  compact = false,
}: {
  profile?: FullProfile
  completeness?: ProfileCompletenessResult
  className?: string
  compact?: boolean
}) {
  const completeness =
    completenessProp ??
    (profile ? calculateProfileCompleteness(profile) : null)

  if (!completeness) return null

  const incompleteSections = completeness.sections.filter(
    (section) => !section.complete
  )

  return (
    <div className={cn("glass-card p-6", className)}>
      <div
        className={cn(
          "flex gap-6",
          compact ? "flex-col items-center text-center" : "flex-col md:flex-row md:items-center"
        )}
      >
        <CircularProgress
          value={completeness.percent}
          size={compact ? 88 : 104}
          label="Profile completeness"
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[#3FA98A]">
            Profile completeness
          </p>
          <h2 className="mt-1 text-xl font-medium text-white">
            {completeness.completedCount} of {completeness.totalSections} sections
            complete
          </h2>
          <p className="mt-2 text-sm text-[#A7A7A7]">
            {getProgressMessage(completeness.percent)}
          </p>
        </div>
      </div>

      {!compact && incompleteSections.length > 0 ? (
        <div className="mt-6 border-t border-[#333333] pt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#707070]">
            Suggested next steps
          </p>
          <ul className="mt-3 space-y-2">
            {incompleteSections.slice(0, 3).map((section) => (
              <li
                key={section.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-[#A7A7A7]">{section.label}</span>
                <span className="shrink-0 text-[#3FA98A]">{section.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function SectionCompletenessDot({
  section,
  className,
}: {
  section: ProfileSectionCompleteness
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-[#242424]",
        section.complete ? "bg-[#3FA98A]" : "bg-[#D6A84F]",
        className
      )}
      aria-hidden
    />
  )
}

export { calculateProfileCompleteness }
