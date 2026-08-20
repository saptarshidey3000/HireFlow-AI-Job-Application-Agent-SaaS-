"use client"

import { cn } from "@/lib/utils"

export function ProfileSection({
  title,
  description,
  children,
  action,
  className,
  hideTitle = false,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  hideTitle?: boolean
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {!hideTitle || action ? (
        <div className="flex items-start justify-between gap-4">
          {!hideTitle ? (
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-white">{title}</h2>
              {description ? (
                <p className="mt-1 text-xs font-medium text-[#A7A7A7]">{description}</p>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          {action}
        </div>
      ) : null}
      <div className="rounded-lg border-2 border-[#2d3835] bg-[#181818] p-6 shadow-[4px_4px_0px_0px_#0d3b2e]">{children}</div>
    </section>
  )
}
