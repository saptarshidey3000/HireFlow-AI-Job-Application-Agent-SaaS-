export type PlanId = "free" | "pro" | "unlimited"

export interface PlanConfig {
  id: PlanId
  name: string
  tagline: string
  description: string
  priceInCents: number
  priceDisplay: string
  interval: "month"
  limit: number // 5 for Free, 25 for Pro, -1 for Unlimited
  features: string[]
  badge?: string
  popular?: boolean
  buttonText: string
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "For exploring automated job hunting",
    description: "Basic daily AI automated job applications with smart resume detection.",
    priceInCents: 0,
    priceDisplay: "$0",
    interval: "month",
    limit: 5,
    features: [
      "5 AI Auto-Applies per day",
      "AI Form Field Detection",
      "Smart Resume & Profile Matching",
      "Real-time Application Status Tracking",
      "Multi-Platform Job Discovery",
      "Basic Community Support",
    ],
    buttonText: "Current Plan",
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "For active job seekers who want more volume",
    description: "Up to 25 automated applications per day with priority queueing.",
    priceInCents: 1900,
    priceDisplay: "$19",
    interval: "month",
    limit: 25,
    badge: "Most Popular",
    popular: true,
    features: [
      "25 AI Auto-Applies per day",
      "Priority AI Cloud Browser Queue",
      "Advanced Multi-Page Form Detection",
      "Automatic Missing Info Diagnostics",
      "Instant Resume Re-Matching",
      "Priority Email & Ticket Support",
    ],
    buttonText: "Upgrade to Pro",
  },
  unlimited: {
    id: "unlimited",
    name: "Unlimited",
    tagline: "For aggressive candidates who never want to miss a role",
    description: "Uncapped daily automated applications with dedicated cloud resources.",
    priceInCents: 4900,
    priceDisplay: "$49",
    interval: "month",
    limit: -1, // Unlimited
    badge: "Maximum Power",
    features: [
      "Unlimited AI Auto-Applies per day",
      "Turbo Dedicated Cloud Sessions",
      "No Daily Throttles or Queue Delays",
      "Full Stagehand AI Browser Automation",
      "Automated Custom Answers Generator",
      "Dedicated 1-on-1 Priority Support",
    ],
    buttonText: "Get Unlimited",
  },
}

export function getPlanConfig(planId: string | null | undefined): PlanConfig {
  if (planId === "pro") return PLANS.pro
  if (planId === "unlimited") return PLANS.unlimited
  return PLANS.free
}

export function isUnlimited(limit: number): boolean {
  return limit === -1 || limit >= 999999
}
