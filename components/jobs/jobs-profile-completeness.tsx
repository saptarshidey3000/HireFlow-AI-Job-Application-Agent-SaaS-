"use client"

import Link from "next/link"
import { Check } from "lucide-react"

import { CircularProgress } from "@/components/profile/circular-progress"
import { calculateProfileCompleteness } from "@/lib/profile/completeness"
import type { FullProfile } from "@/lib/supabase/database.types"

function getJobsChecklist(profile: FullProfile) {
  return [
    {
      label: "Skills",
      complete: profile.skills.length > 0,
    },
    {
      label: "Experience",
      complete: profile.workExperiences.length > 0,
    },
    {
      label: "Education",
      complete: profile.education.length > 0,
    },
    {
      label: "Preferred Location",
      complete: Boolean(profile.profile.location?.trim()),
    },
  ]
}

export function JobsProfileCompleteness({
  profile,
}: {
  profile: FullProfile
}) {
  const completeness = calculateProfileCompleteness(profile)
  const checklist = getJobsChecklist(profile)
  const isComplete = completeness.percent >= 80

  return (
    <div className="glass-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[#3FA98A]">
        Profile Completeness
      </p>

      <div className="mt-4 flex items-center gap-4">
        <CircularProgress value={completeness.percent} size={72} strokeWidth={6} />
        <div>
          <p className="text-2xl font-semibold text-white">
            {completeness.percent}%
          </p>
          <p className="text-xs text-[#707070]">
            Complete your profile to improve job matches.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {checklist.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-[#A7A7A7]">{item.label}</span>
            {item.complete ? (
              <Check className="size-4 text-[#3FA98A]" />
            ) : (
              <span className="size-2 rounded-full bg-[#D6A84F]" />
            )}
          </li>
        ))}
      </ul>

      {!isComplete ? (
        <Link
          href="/dashboard/profile"
          className="mt-5 inline-flex text-sm text-[#3FA98A] transition hover:text-white"
        >
          Complete Profile →
        </Link>
      ) : null}
    </div>
  )
}
