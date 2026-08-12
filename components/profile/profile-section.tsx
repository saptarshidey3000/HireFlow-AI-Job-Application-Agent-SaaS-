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
              <h2 className="text-lg font-medium text-white">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm text-[#A7A7A7]">{description}</p>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          {action}
        </div>
      ) : null}
      <div className="glass-card p-6">{children}</div>
    </section>
  )
}
