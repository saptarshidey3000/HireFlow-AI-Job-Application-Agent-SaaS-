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
          "flex size-10 items-center justify-center rounded-lg border transition-[border-color,background] duration-150 ease-in-out",
          "border-[rgba(63,169,138,0.18)] bg-[rgba(13,59,46,0.32)]",
          "text-[#3FA98A] hover:border-[rgba(63,169,138,0.35)] hover:bg-[rgba(13,59,46,0.45)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8A70]/30"
        )}
      >
        {isUnlimited ? <Crown className="size-4 text-[#eab308]" /> : <Sparkles className="size-4" />}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "rounded-[10px] border p-3 transition-[border-color,background] duration-150 ease-in-out",
        "border-[rgba(63,169,138,0.18)] bg-[rgba(13,59,46,0.32)]"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <Crown className="size-3.5 text-[#eab308]" />
          ) : (
            <Sparkles className="size-3.5 text-[#3FA98A]" />
          )}
          <p className="text-xs font-semibold text-[#F5F5F5]">{planName} Plan</p>
        </div>
        <span className="text-[10px] font-medium text-[#3FA98A]">
          {isUnlimited ? "Unlimited" : `${used}/${limit} today`}
        </span>
      </div>

      <div className="mt-2.5">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[#333333]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="AI credits usage"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-in-out",
              percent >= 100 && !isUnlimited
                ? "bg-[#f87171]"
                : isUnlimited
                ? "bg-gradient-to-r from-[#eab308] to-[#3FA98A]"
                : "bg-[#3FA98A]"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <Link
        href="/dashboard/billing"
        className="mt-2.5 inline-flex text-xs font-medium text-[#3FA98A] transition-colors duration-150 ease-in-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8A70]/30"
      >
        {isUnlimited ? "Manage Subscription →" : "Upgrade Plan →"}
      </Link>
    </div>
  )
}
