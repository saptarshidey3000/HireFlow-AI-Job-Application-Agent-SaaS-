"use client"

import type { JobActivityItem } from "@/lib/jobs/types"

export function RecentActivity({ items }: { items: JobActivityItem[] }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm font-medium text-white">Recent Activity</p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[#707070]">
          Activity from resume updates, saved jobs, and applications will appear
          here.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#3FA98A]" />
              <div>
                <p className="text-sm text-[#A7A7A7]">{item.label}</p>
                <p className="text-xs text-[#707070]">{item.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
