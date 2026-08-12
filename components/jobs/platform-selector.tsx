"use client"

import {
  Briefcase,
  Building2,
  Globe2,
  GraduationCap,
  Link2,
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
  indeed: Search,
  linkedin: Link2,
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

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-white">Job Platforms</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {JOB_PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform.id)
          const Icon = PLATFORM_ICONS[platform.id]
          const count = counts?.[platform.id]

          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => toggle(platform.id)}
              className={cn(
                "glass-card min-w-[140px] shrink-0 px-4 py-3 text-left transition-all",
                isSelected
                  ? "border-[#2B8A70] bg-[rgba(13,59,46,0.55)]"
                  : "hover:border-[rgba(63,169,138,0.18)]"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-[rgba(63,169,138,0.18)] text-[#3FA98A]"
                      : "bg-[rgba(255,255,255,0.04)] text-[#707070]"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {platform.name}
                  </p>
                  <p className="text-xs text-[#707070]">
                    {count !== undefined ? `${count} jobs` : platform.description}
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
