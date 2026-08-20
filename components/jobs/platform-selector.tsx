"use client"

import {
  Briefcase,
  Building2,
  Check,
  Compass,
  Globe2,
  GraduationCap,
  Layers3,
  Rocket,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { JOB_PLATFORMS } from "@/lib/jobs/platforms"
import type { JobPlatform } from "@/lib/jobs/types"

const PLATFORM_ICONS: Record<
  JobPlatform,
  React.ComponentType<{ className?: string }>
> = {
  greenhouse: Building2,
  upwork: Briefcase,
  workable: Globe2,
  wellfound: Rocket,
  internshala: GraduationCap,
  lever: Layers3,
  indeed: Search,
  naukri: Compass,
}

// Display-friendly descriptions matching reference "Job board"
const PLATFORM_DESCRIPTIONS: Record<JobPlatform, string> = {
  greenhouse: "Job board",
  upwork: "Freelance & Remote",
  workable: "Job board",
  wellfound: "Job board",
  internshala: "Internships",
  lever: "Job board",
  indeed: "Job board",
  naukri: "Job board",
}

export function PlatformSelector({
  selected,
  onChange,
  counts,
}: {
  selected: JobPlatform[]
  onChange: (platforms: JobPlatform[]) => void
  counts?: Partial<Record<JobPlatform, number>>
}) {
  const toggle = (platform: JobPlatform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((item) => item !== platform))
      return
    }
    onChange([...selected, platform])
  }

  const selectAll = () => {
    onChange(JOB_PLATFORMS.map((p) => p.id))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-white">
          Job Platforms
        </h2>
        <div className="flex items-center gap-3">
          {selected.length < JOB_PLATFORMS.length ? (
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-[#3FA98A] hover:underline"
            >
              Select all
            </button>
          ) : (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-[#A7A7A7] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {JOB_PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform.id)
          const Icon = PLATFORM_ICONS[platform.id] ?? Building2
          const count = counts?.[platform.id]
          const description =
            count !== undefined
              ? `${count} jobs`
              : PLATFORM_DESCRIPTIONS[platform.id] ?? "Job board"

          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => toggle(platform.id)}
              className={cn(
                "group relative flex min-w-[155px] sm:min-w-[170px] shrink-0 items-center justify-between rounded-xl p-3.5 text-left transition-all duration-200",
                "backdrop-blur-md cursor-pointer select-none",
                isSelected
                  ? "bg-[rgba(13,59,46,0.55)] border border-[#2B8A70] text-white shadow-[0_0_15px_rgba(43,138,112,0.18)]"
                  : "bg-[#242424] border border-[#333333] text-[#A7A7A7] hover:border-[#404040] hover:bg-[#2A2A2A]"
              )}
            >
              {/* Top right check indicator */}
              <div
                className={cn(
                  "absolute right-2.5 top-2.5 flex size-4.5 items-center justify-center rounded-full transition-all",
                  isSelected
                    ? "bg-[#2B8A70] text-white shadow-sm ring-2 ring-[rgba(13,59,46,0.8)]"
                    : "border border-[#404040] bg-transparent opacity-0 group-hover:opacity-40"
                )}
              >
                <Check className={cn("size-2.5 stroke-[3]", isSelected ? "block" : "hidden")} />
              </div>

              <div className="flex items-center gap-3 pr-4">
                {/* Platform Icon Box */}
                <div
                  className={cn(
                    "flex size-9.5 items-center justify-center rounded-lg transition-colors shrink-0",
                    isSelected
                      ? "bg-[rgba(43,138,112,0.25)] text-[#3FA98A] border border-[rgba(63,169,138,0.3)]"
                      : "bg-[rgba(255,255,255,0.04)] text-[#707070] border border-[#333333]"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold leading-tight transition-colors",
                      isSelected ? "text-white" : "text-[#D4D4D4] group-hover:text-white"
                    )}
                  >
                    {platform.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#707070]">
                    {description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
