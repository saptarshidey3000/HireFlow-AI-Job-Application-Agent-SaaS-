"use client"

import { Clock3 } from "lucide-react"

import type { JobActivityItem } from "@/lib/jobs/types"

export function RecentActivity({ items }: { items: JobActivityItem[] }) {
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-5 md:p-6 bg-[rgba(36,36,36,0.55)] border border-[rgba(255,255,255,0.06)] shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-white">
          Recent Activity
        </h3>
        {items.length > 0 && (
          <span className="text-[11px] font-medium text-[#707070]">
            Live Sync
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-4 text-center">
          <Clock3 className="mx-auto size-5 text-[#707070]" />
          <p className="mt-2 text-xs text-[#A7A7A7]">No recent activity yet.</p>
          <p className="mt-0.5 text-[11px] text-[#707070]">
            Activity from resume uploads, saved jobs, and applications will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className="mt-1.5 flex size-2 shrink-0 rounded-full bg-[#3FA98A] shadow-[0_0_8px_rgba(63,169,138,0.5)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#E0E0E0]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] text-[#707070]">{item.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
