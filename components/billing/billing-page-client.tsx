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
        <div className="flex items-center justify-between rounded-xl border border-[rgba(43,138,112,0.4)] bg-[rgba(13,59,46,0.7)] px-4 py-3 text-xs text-white shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#3FA98A] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs text-[#707070] hover:text-white ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dev Mode Stripe Banner */}
      {!isStripeConfigured && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[rgba(214,168,79,0.3)] bg-[rgba(30,22,10,0.55)] p-4 text-xs text-[#CFCFCF]">
          <div className="flex items-start gap-2.5">
            <Sparkles className="size-4.5 text-[#D6A84F] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Stripe Local Sandbox Mode: </span>
              <span>
                <code className="text-[#D6A84F]">STRIPE_SECRET_KEY</code> is not configured in <code className="text-[#D6A84F]">.env.local</code>. Upgrades will simulate immediately in Supabase so you can test daily limits and full features without test card checkout. To enable real Stripe Checkout, add your Stripe Secret Key to <code className="text-[#D6A84F]">.env.local</code>.
              </span>
            </div>
          </div>
        </div>
      )}

      {syncing && (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#3FA98A]/30 bg-[rgba(13,59,46,0.4)] p-4 text-xs text-[#3FA98A]">
          <Loader2 className="size-4 animate-spin shrink-0" />
          <span>Synchronizing your latest subscription with Stripe...</span>
        </div>
      )}

      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl border border-[rgba(43,138,112,0.3)] bg-[rgba(13,59,46,0.4)] text-[#3FA98A]">
            <CreditCard className="size-4.5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Billing & Subscriptions
          </h1>
        </div>
        <p className="text-sm text-[#A7A7A7]">
          Manage your subscription plan, view daily automated application usage, and access payment receipts.
        </p>
      </div>

      {/* Section 1: Current Plan & Daily Usage Info */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Current Plan Overview Card */}
        <div className="glass-card flex flex-col justify-between rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(32,32,32,0.6)] p-6 lg:col-span-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#707070]">
                  Current Plan
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    plan.id === "unlimited"
                      ? "border border-[#eab308]/40 bg-[#eab308]/15 text-[#eab308]"
                      : plan.id === "pro"
                      ? "border border-[#3FA98A]/40 bg-[rgba(13,59,46,0.4)] text-[#3FA98A]"
                      : "border border-[#404040] bg-[#242424] text-[#CFCFCF]"
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
                  "rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize",
                  subscription.status === "active"
                    ? "border-[#3FA98A]/30 bg-[rgba(13,59,46,0.3)] text-[#3FA98A]"
                    : "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]"
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
              <p className="mt-1 text-xs text-[#A7A7A7]">{plan.tagline}</p>
            </div>

            <div className="space-y-2 border-t border-[#333333] pt-4 text-xs">
              <div className="flex items-center justify-between text-[#CFCFCF]">
                <span className="text-[#707070]">Daily AI Apply Limit:</span>
                <span className="font-semibold text-white">
                  {isCurrentPlanUnlimited ? "Unlimited" : `${plan.limit} applications / day`}
                </span>
              </div>

              {subscription.current_period_end && plan.id !== "free" && (
                <div className="flex items-center justify-between text-[#CFCFCF]">
                  <span className="text-[#707070]">
                    {subscription.cancel_at_period_end ? "Expires on:" : "Next Renewal Date:"}
                  </span>
                  <span className="font-medium text-white">
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
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#333333] pt-4">
            {subscription.stripe_customer_id ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={portalLoading}
                onClick={handleOpenPortal}
                className="h-9 gap-2 rounded-xl border-[#333333] bg-[#242424] text-xs font-medium text-white transition-all hover:border-[#404040] hover:bg-[#2c2c2c]"
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
                className="h-9 gap-1.5 rounded-xl bg-[#2B8A70] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#3FA98A] hover:shadow-[0_0_16px_rgba(43,138,112,0.3)]"
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
                className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-[#2B8A70] to-[#3FA98A] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110"
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
        <div className="glass-card flex flex-col justify-between rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(32,32,32,0.6)] p-6 lg:col-span-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#707070]">
                Today&apos;s Usage Information
              </span>
              <span className="text-xs text-[#707070] flex items-center gap-1">
                <Clock className="size-3" /> Resets Daily at Midnight UTC
              </span>
            </div>

            {isCurrentPlanUnlimited ? (
              /* Unlimited usage display */
              <div className="space-y-3 rounded-xl border border-[rgba(63,169,138,0.25)] bg-[rgba(13,59,46,0.35)] p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[#3FA98A]">
                  <InfinityIcon className="size-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Unlimited Usage Active</h3>
                  <p className="text-xs text-[#CFCFCF]">
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
                      "text-xs font-semibold",
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
                <div className="h-2.5 w-full rounded-full bg-[#242424] overflow-hidden border border-[#333333]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
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

            <div className="rounded-xl border border-[rgba(255,255,255,0.04)] bg-[#1a1a1a] p-3.5 space-y-2 text-xs text-[#A7A7A7]">
              <div className="flex items-center gap-2 text-white font-medium">
                <ShieldCheck className="size-4 text-[#3FA98A]" />
                <span>Fair-Use AI Auto-Apply Policies</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Daily limits safeguard cloud browser instances against platform rate-limits, ensuring safe and high-deliverability submissions for your job applications.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#333333] pt-4 text-xs text-[#707070]">
            <span>Date: {usage.usageDate}</span>
            <span className="text-[#3FA98A] font-medium">Auto-refreshed in real-time</span>
          </div>
        </div>
      </div>

      {/* Section 2: Available Subscription Plans */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Available Plans & Pricing
          </h2>
          <p className="text-xs text-[#A7A7A7]">
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
                  "glass-card relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-200",
                  isPopular
                    ? "border-[#2B8A70] bg-[rgba(13,59,46,0.25)] shadow-[0_0_30px_rgba(43,138,112,0.15)] ring-1 ring-[#2B8A70]/50"
                    : "border-[rgba(255,255,255,0.06)] bg-[rgba(32,32,32,0.5)] hover:border-[#404040]"
                )}
              >
                {/* Badge if available */}
                {p.badge && (
                  <span
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      isPopular
                        ? "bg-[#2B8A70] text-white shadow-md"
                        : "bg-[#eab308] text-black shadow-md"
                    )}
                  >
                    {p.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="mt-1 text-xs text-[#A7A7A7]">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      {p.priceDisplay}
                    </span>
                    <span className="text-xs text-[#707070]">/ month</span>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-2.5 border-t border-[#333333] pt-4 text-xs text-[#CFCFCF]">
                    {p.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[rgba(63,169,138,0.2)] text-[#3FA98A] mt-0.5">
                          <Check className="size-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action Button */}
                <div className="mt-8 border-t border-[#333333] pt-4">
                  {isCurrent ? (
                    <Button
                      type="button"
                      disabled
                      className="w-full rounded-xl border border-[#3FA98A]/40 bg-[rgba(13,59,46,0.4)] text-xs font-semibold text-[#3FA98A]"
                    >
                      <Check className="size-3.5 mr-1" />
                      <span>Current Active Plan</span>
                    </Button>
                  ) : p.id === "free" ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenPortal}
                      className="w-full rounded-xl border-[#333333] text-xs font-medium text-[#A7A7A7] hover:text-white"
                    >
                      Downgrade in Portal
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleSubscribe(p.id as "pro" | "unlimited")}
                      disabled={loadingPlan === p.id}
                      className={cn(
                        "w-full rounded-xl text-xs font-semibold text-white shadow-sm transition-all",
                        isPopular
                          ? "bg-[#2B8A70] hover:bg-[#3FA98A] hover:shadow-[0_0_16px_rgba(43,138,112,0.35)]"
                          : "bg-[#242424] border border-[#333333] hover:border-[#2B8A70] hover:bg-[rgba(13,59,46,0.3)] hover:text-white"
                      )}
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
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Billing History & Receipts
          </h2>
          <p className="text-xs text-[#707070]">
            Review all previous subscription invoices and downloaded tax receipts.
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(32,32,32,0.4)] p-8 text-center text-xs text-[#707070]">
            <Calendar className="size-8 text-[#404040] mb-2" />
            <p>No billing invoices recorded yet.</p>
            <p className="text-[11px] text-[#555555] mt-0.5">
              Invoices will automatically appear here upon completed subscription payments.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(32,32,32,0.5)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#333333] bg-[#1a1a1a] text-[#707070]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Invoice Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a] text-[#CFCFCF]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-4 py-3 font-medium text-white">
                      {new Date(inv.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      ${(inv.amount_paid / 100).toFixed(2)}{" "}
                      <span className="uppercase text-[10px] text-[#707070]">
                        {inv.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-medium capitalize",
                          inv.status === "paid"
                            ? "border border-[#3FA98A]/30 bg-[rgba(13,59,46,0.3)] text-[#3FA98A]"
                            : "border border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]"
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
                          className="inline-flex items-center gap-1 text-xs text-[#3FA98A] hover:underline"
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
