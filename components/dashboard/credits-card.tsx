"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Crown, Infinity as InfinityIcon, Sparkles } from "lucide-react"

import { getUserSubscriptionAndUsage, type SubscriptionAndUsageData } from "@/lib/actions/billing"
import { cn } from "@/lib/utils"

export function CreditsCard({ collapsed }: { collapsed: boolean }) {
  const [data, setData] = useState<SubscriptionAndUsageData | null>(null)

  useEffect(() => {
    getUserSubscriptionAndUsage().then((res) => {
      if (res.success && res.data) {
        setData(res.data)
      }
    })
  }, [])

  const planName = data?.plan.name || "Free"
  const isUnlimited = data?.usage.isUnlimited ?? false
  const used = data?.usage.usedToday ?? 0
  const limit = data?.usage.limit ?? 5
  const percent = isUnlimited ? 100 : Math.min(100, Math.round((used / limit) * 100))

  if (collapsed) {
    return (
      <Link
        href="/dashboard/billing"
        aria-label="AI Credits — Manage credits"
        className={cn(
          "flex size-10 items-center justify-center rounded-md border-2 transition-all duration-120 ease-in-out",
          "border-[#2b8a70] bg-[#0d3b2e] shadow-[2px_2px_0px_0px_#000000]",
          "text-[#3FA98A] hover:bg-[#145a46] hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fa98a]/50"
        )}
      >
        {isUnlimited ? <Crown className="size-4 text-[#eab308]" /> : <Sparkles className="size-4" />}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "rounded-md border-2 p-3 transition-all duration-120 ease-in-out",
        "border-[#2b8a70] bg-[#0d3b2e]/90 shadow-[3px_3px_0px_0px_#000000]"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isUnlimited ? (
            <Crown className="size-3.5 text-[#eab308]" />
          ) : (
            <Sparkles className="size-3.5 text-[#3FA98A]" />
          )}
          <p className="text-xs font-bold uppercase tracking-wide text-[#F5F5F5]">{planName} Plan</p>
        </div>
        <span className="text-[10px] font-bold text-[#3FA98A]">
          {isUnlimited ? "Unlimited" : `${used}/${limit} today`}
        </span>
      </div>

      <div className="mt-2.5">
        <div
          className="h-2 w-full overflow-hidden rounded-[2px] border border-[#2b8a70]/50 bg-[#111111]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="AI credits usage"
        >
          <div
            className={cn(
              "h-full transition-all duration-200 ease-in-out",
              percent >= 100 && !isUnlimited
                ? "bg-[#f87171]"
                : isUnlimited
                ? "bg-[#eab308]"
                : "bg-[#3FA98A]"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <Link
        href="/dashboard/billing"
        className="mt-2.5 inline-flex text-xs font-bold text-[#3FA98A] transition-colors duration-120 ease-in-out hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fa98a]/50"
      >
        {isUnlimited ? "Manage Plan →" : "Upgrade Plan →"}
      </Link>
    </div>
  )
}
