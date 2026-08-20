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
                "group relative flex min-w-[155px] sm:min-w-[170px] shrink-0 items-center justify-between rounded-md p-3 text-left transition-all duration-120 cursor-pointer select-none",
                isSelected
                  ? "border-2 border-[#2b8a70] bg-[#0d3b2e] text-white shadow-[3px_3px_0px_0px_#000000]"
                  : "border-2 border-[#384843] bg-[#1a1a1a] text-[#A7A7A7] shadow-[2px_2px_0px_0px_#000000] hover:border-[#3fa98a] hover:bg-[#242424] hover:text-white"
              )}
            >
              {/* Top right check indicator */}
              <div
                className={cn(
                  "absolute right-2 top-2 flex size-4 items-center justify-center rounded-[3px] transition-all",
                  isSelected
                    ? "border border-[#3fa98a] bg-[#2B8A70] text-white"
                    : "border border-[#404040] bg-transparent opacity-0 group-hover:opacity-40"
                )}
              >
                <Check className={cn("size-2.5 stroke-[3]", isSelected ? "block" : "hidden")} />
              </div>

              <div className="flex items-center gap-3 pr-3">
                {/* Platform Icon Box */}
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md transition-colors shrink-0",
                    isSelected
                      ? "border-2 border-[#3fa98a] bg-[#145a46] text-white"
                      : "border-2 border-[#384843] bg-[#141414] text-[#707070]"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-bold leading-tight transition-colors",
                      isSelected ? "text-white" : "text-[#D4D4D4] group-hover:text-white"
                    )}
                  >
                    {platform.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-[#707070]">
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
