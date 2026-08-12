"use client"

import { cn } from "@/lib/utils"

export function ProfileSection({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-[#A7A7A7]">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="glass-card p-6">{children}</div>
    </section>
  )
}
