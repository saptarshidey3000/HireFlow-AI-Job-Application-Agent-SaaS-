"use client"

import { Clock3 } from "lucide-react"

import type { JobActivityItem } from "@/lib/jobs/types"

export function RecentActivity({ items }: { items: JobActivityItem[] }) {
  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-[#2d3835] bg-[#181818] p-5 shadow-[4px_4px_0px_0px_#0d3b2e] md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Recent Activity
        </h3>
        {items.length > 0 && (
          <span className="rounded-[3px] border border-[#2b8a70] bg-[#0d3b2e] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#3FA98A]">
            Live Sync
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-md border-2 border-[#384843] bg-[#141414] p-4 text-center">
          <Clock3 className="mx-auto size-5 text-[#707070]" />
          <p className="mt-2 text-xs font-semibold text-[#A7A7A7]">No recent activity yet.</p>
          <p className="mt-0.5 text-[11px] text-[#707070]">
            Activity from resume uploads, saved jobs, and applications will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className="mt-1.5 flex size-2 shrink-0 rounded-full bg-[#3FA98A]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#E0E0E0]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-[#707070]">{item.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
