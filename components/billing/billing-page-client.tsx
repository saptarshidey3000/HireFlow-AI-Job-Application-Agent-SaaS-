"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Flame,
  Infinity as InfinityIcon,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  createCheckoutSession,
  createCustomerPortalSession,
  syncCheckoutSession,
  type SubscriptionAndUsageData,
} from "@/lib/actions/billing"
import { PLANS, type PlanConfig, type PlanId } from "@/lib/stripe/config"
import { cn } from "@/lib/utils"

export function BillingPageClient({
  initialData,
}: {
  initialData: SubscriptionAndUsageData
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionAndUsageData>(initialData)
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage((c) => (c === message ? null : c))
    }, 5000)
  }

  // Handle return from Stripe Checkout / Sandbox
  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    const isSuccess = searchParams.get("success") === "true"
    const isCanceled = searchParams.get("canceled") === "true"
    const isDevSandbox = searchParams.get("dev_sandbox") === "true"
    const isPortalReset = searchParams.get("portal_reset") === "true"

    if (sessionId && isSuccess) {
      setSyncing(true)
      syncCheckoutSession(sessionId).then((res) => {
        setSyncing(false)
        if (res.success && res.data) {
          showToast(`🎉 Welcome to ${res.data.planName}! Your subscription is active.`)
        }
        router.replace("/dashboard/billing")
      })
    } else if (isDevSandbox) {
      showToast("🎉 Plan activated successfully! (Local Sandbox Mode)")
      router.replace("/dashboard/billing")
    } else if (isPortalReset) {
      showToast("Subscription reset to Free plan.")
      router.replace("/dashboard/billing")
    } else if (isCanceled) {
      showToast("Stripe checkout was canceled. No charges were made.")
      router.replace("/dashboard/billing")
    }
  }, [searchParams, router])

  const handleSubscribe = async (planId: "pro" | "unlimited") => {
    setLoadingPlan(planId)
    const result = await createCheckoutSession(planId)
    setLoadingPlan(null)

    if (!result.success) {
      showToast(result.error || "Failed to start checkout. Please try again.")
      return
    }

    if (result.data.url) {
      window.location.href = result.data.url
    }
  }

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    const result = await createCustomerPortalSession()
    setPortalLoading(false)

    if (!result.success) {
      showToast(result.error || "Could not open Stripe portal.")
      return
    }

    if (result.data.url) {
      window.location.href = result.data.url
    }
  }

  const { subscription, plan, usage, invoices, isStripeConfigured } = data
  const isCurrentPlanUnlimited = usage.isUnlimited
  const usagePercent = isCurrentPlanUnlimited
    ? 100
    : Math.min(100, Math.round((usage.usedToday / usage.limit) * 100))

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] px-4 py-3 text-xs font-bold text-white shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#3FA98A] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-[#707070] hover:text-white ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dev Mode Stripe Banner */}
      {!isStripeConfigured && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border-2 border-[#D6A84F] bg-[rgba(30,22,10,0.85)] p-4 text-xs text-[#CFCFCF] shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-start gap-2.5">
            <Sparkles className="size-4.5 text-[#D6A84F] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase text-white">Stripe Sandbox Mode: </span>
              <span>
                <code className="text-[#D6A84F]">STRIPE_SECRET_KEY</code> is not configured in <code className="text-[#D6A84F]">.env.local</code>. Upgrades will simulate immediately in Supabase so you can test daily limits and full features without test card checkout.
              </span>
            </div>
          </div>
        </div>
      )}

      {syncing && (
        <div className="flex items-center gap-2.5 rounded-md border-2 border-[#3FA98A] bg-[#0d3b2e] p-4 text-xs font-bold text-[#3FA98A] shadow-[3px_3px_0px_0px_#000000]">
          <Loader2 className="size-4 animate-spin shrink-0" />
          <span>Synchronizing your latest subscription with Stripe...</span>
        </div>
      )}

      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A] shadow-[2px_2px_0px_0px_#000000]">
            <CreditCard className="size-4.5" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
            Billing & Subscriptions
          </h1>
        </div>
        <p className="text-sm font-medium text-[#A7A7A7]">
          Manage your subscription plan, view daily automated application usage, and access payment receipts.
        </p>
      </div>

      {/* Section 1: Current Plan & Daily Usage Info */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Current Plan Overview Card */}
        <div className="flex flex-col justify-between rounded-lg border-2 border-[#2d3835] bg-[#181818] p-6 shadow-[4px_4px_0px_0px_#0d3b2e] lg:col-span-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#707070]">
                  Current Plan
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-[4px] border-2 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider shadow-[1px_1px_0px_0px_#000000]",
                    plan.id === "unlimited"
                      ? "border-[#eab308] bg-[#3a2e12] text-[#eab308]"
                      : plan.id === "pro"
                      ? "border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A]"
                      : "border-[#384843] bg-[#141414] text-[#CFCFCF]"
                  )}
                >
                  {plan.id === "unlimited" ? (
                    <Crown className="size-3" />
                  ) : (
                    <Sparkles className="size-3" />
                  )}
                  {plan.name}
                </span>
              </div>

              <span
                className={cn(
                  "rounded-[4px] border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                  subscription.status === "active"
                    ? "border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A]"
                    : "border-[#f87171] bg-[#381414] text-[#f87171]"
                )}
              >
                {subscription.status}
              </span>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-white">
                {plan.priceDisplay}
                <span className="text-sm font-normal text-[#707070]"> / month</span>
              </div>
              <p className="mt-1 text-xs font-medium text-[#A7A7A7]">{plan.tagline}</p>
            </div>

            <div className="space-y-2 border-t-2 border-[#2d3835] pt-4 text-xs">
              <div className="flex items-center justify-between text-[#CFCFCF]">
                <span className="font-semibold text-[#707070]">Daily AI Apply Limit:</span>
                <span className="font-bold text-white">
                  {isCurrentPlanUnlimited ? "Unlimited" : `${plan.limit} applications / day`}
                </span>
              </div>

              {subscription.current_period_end && plan.id !== "free" && (
                <div className="flex items-center justify-between text-[#CFCFCF]">
                  <span className="font-semibold text-[#707070]">
                    {subscription.cancel_at_period_end ? "Expires on:" : "Next Renewal Date:"}
                  </span>
                  <span className="font-bold text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Manage Subscription Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t-2 border-[#2d3835] pt-4">
            {subscription.stripe_customer_id ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={portalLoading}
                onClick={handleOpenPortal}
                className="h-9 gap-2 text-xs font-bold uppercase"
              >
                {portalLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="size-3.5 text-[#3FA98A]" />
                )}
                <span>Manage in Stripe Portal</span>
              </Button>
            ) : null}

            {plan.id === "free" && (
              <Button
                type="button"
                size="sm"
                onClick={() => handleSubscribe("pro")}
                disabled={loadingPlan === "pro"}
                className="h-9 gap-1.5 px-4 text-xs font-bold uppercase tracking-wider"
              >
                {loadingPlan === "pro" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                <span>Upgrade to Pro</span>
              </Button>
            )}

            {plan.id === "pro" && (
              <Button
                type="button"
                size="sm"
                onClick={() => handleSubscribe("unlimited")}
                disabled={loadingPlan === "unlimited"}
                className="h-9 gap-1.5 px-4 text-xs font-bold uppercase tracking-wider"
              >
                {loadingPlan === "unlimited" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Crown className="size-3.5 text-[#eab308]" />
                )}
                <span>Upgrade to Unlimited</span>
              </Button>
            )}
          </div>
        </div>

        {/* Daily Usage Information Card */}
        <div className="flex flex-col justify-between rounded-lg border-2 border-[#2d3835] bg-[#181818] p-6 shadow-[4px_4px_0px_0px_#0d3b2e] lg:col-span-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#707070]">
                Today&apos;s Usage Information
              </span>
              <span className="text-xs font-semibold text-[#707070] flex items-center gap-1">
                <Clock className="size-3" /> Resets Daily at Midnight UTC
              </span>
            </div>

            {isCurrentPlanUnlimited ? (
              /* Unlimited usage display */
              <div className="space-y-3 rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] p-4 text-center shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-center gap-2 text-[#3FA98A]">
                  <InfinityIcon className="size-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase text-white">Unlimited Usage Active</h3>
                  <p className="text-xs font-medium text-[#CFCFCF]">
                    You have submitted <strong className="text-white">{usage.usedToday}</strong> AI automated applications today. No daily caps applied.
                  </p>
                </div>
              </div>
            ) : (
              /* Capped usage display */
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-white">
                    {usage.usedToday}
                    <span className="text-sm font-normal text-[#707070]">
                      {" "}
                      / {usage.limit} used today
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold uppercase",
                      usage.remainingToday === 0
                        ? "text-[#f87171]"
                        : usage.remainingToday <= 2
                        ? "text-[#fbbf24]"
                        : "text-[#3FA98A]"
                    )}
                  >
                    {usage.remainingToday} remaining today
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full rounded-[4px] bg-[#141414] overflow-hidden border-2 border-[#384843] shadow-[1px_1px_0px_0px_#000000]">
                  <div
                    className={cn(
                      "h-full rounded-none transition-all duration-500",
                      usagePercent >= 100
                        ? "bg-[#f87171]"
                        : usagePercent >= 75
                        ? "bg-[#fbbf24]"
                        : "bg-[#3FA98A]"
                    )}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="rounded-md border-2 border-[#384843] bg-[#141414] p-3.5 space-y-2 text-xs text-[#A7A7A7]">
              <div className="flex items-center gap-2 text-white font-bold uppercase">
                <ShieldCheck className="size-4 text-[#3FA98A]" />
                <span>Fair-Use AI Auto-Apply Policies</span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed">
                Daily limits safeguard cloud browser instances against platform rate-limits, ensuring safe and high-deliverability submissions for your job applications.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t-2 border-[#2d3835] pt-4 text-xs text-[#707070]">
            <span className="font-semibold">Date: {usage.usageDate}</span>
            <span className="text-[#3FA98A] font-bold uppercase">Auto-refreshed in real-time</span>
          </div>
        </div>
      </div>

      {/* Section 2: Available Subscription Plans */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-tight text-white sm:text-2xl">
            Available Plans & Pricing
          </h2>
          <p className="text-xs font-medium text-[#A7A7A7]">
            Choose the subscription that fits your search speed. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(["free", "pro", "unlimited"] as PlanId[]).map((planId) => {
            const p = PLANS[planId]
            const isCurrent = plan.id === p.id
            const isPopular = p.popular

            return (
              <div
                key={p.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-lg border-2 p-6 transition-all duration-120",
                  isPopular
                    ? "border-[#2b8a70] bg-[#0d3b2e]/60 shadow-[6px_6px_0px_0px_#000000]"
                    : "border-[#2d3835] bg-[#181818] shadow-[4px_4px_0px_0px_#0d3b2e]"
                )}
              >
                {/* Badge if available */}
                {p.badge && (
                  <span
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 rounded-[4px] border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]",
                      isPopular
                        ? "border-[#3fa98a] bg-[#2B8A70] text-white"
                        : "border-[#eab308] bg-[#eab308] text-black"
                    )}
                  >
                    {p.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold uppercase text-white">{p.name}</h3>
                    <p className="mt-1 text-xs font-medium text-[#A7A7A7]">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      {p.priceDisplay}
                    </span>
                    <span className="text-xs font-semibold text-[#707070]">/ month</span>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-2.5 border-t-2 border-[#2d3835] pt-4 text-xs text-[#CFCFCF]">
                    {p.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A] mt-0.5">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                        <span className="font-medium leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action Button */}
                <div className="mt-8 border-t-2 border-[#2d3835] pt-4">
                  {isCurrent ? (
                    <Button
                      type="button"
                      disabled
                      className="w-full border-2 border-[#2b8a70] bg-[#0d3b2e] text-xs font-bold uppercase text-[#3FA98A] shadow-none"
                    >
                      <Check className="size-3.5 mr-1" />
                      <span>Current Active Plan</span>
                    </Button>
                  ) : p.id === "free" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenPortal}
                      className="w-full text-xs font-bold uppercase"
                    >
                      Downgrade in Portal
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleSubscribe(p.id as "pro" | "unlimited")}
                      disabled={loadingPlan === p.id}
                      className="w-full text-xs font-bold uppercase tracking-wider"
                    >
                      {loadingPlan === p.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <span>{p.buttonText} →</span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 3: Invoices & Payment History */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold uppercase tracking-tight text-white sm:text-xl">
            Billing History & Receipts
          </h2>
          <p className="text-xs font-medium text-[#707070]">
            Review all previous subscription invoices and downloaded tax receipts.
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-[#2d3835] bg-[#181818] p-8 text-center text-xs font-medium text-[#707070] shadow-[4px_4px_0px_0px_#0d3b2e]">
            <Calendar className="size-8 text-[#404040] mb-2" />
            <p>No billing invoices recorded yet.</p>
            <p className="text-[11px] text-[#555555] mt-0.5">
              Invoices will automatically appear here upon completed subscription payments.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border-2 border-[#2d3835] bg-[#181818] shadow-[4px_4px_0px_0px_#0d3b2e]">
            <table className="w-full text-left text-xs">
              <thead className="border-b-2 border-[#2d3835] bg-[#141414] text-[#707070]">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase">Date</th>
                  <th className="px-4 py-3 font-bold uppercase">Amount</th>
                  <th className="px-4 py-3 font-bold uppercase">Status</th>
                  <th className="px-4 py-3 font-bold uppercase text-right">Invoice Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#242424] text-[#CFCFCF]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1f1f1f]">
                    <td className="px-4 py-3 font-bold text-white">
                      {new Date(inv.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      ${(inv.amount_paid / 100).toFixed(2)}{" "}
                      <span className="uppercase text-[10px] text-[#707070]">
                        {inv.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-[4px] border px-2 py-0.5 text-[10px] font-bold uppercase",
                          inv.status === "paid"
                            ? "border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A]"
                            : "border-[#f87171] bg-[#381414] text-[#f87171]"
                        )}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.invoice_pdf || inv.hosted_invoice_url ? (
                        <a
                          href={inv.invoice_pdf || inv.hosted_invoice_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#3FA98A] hover:underline"
                        >
                          <Download className="size-3" />
                          <span>PDF Receipt</span>
                        </a>
                      ) : (
                        <span className="text-[#555555]">Receipt unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
