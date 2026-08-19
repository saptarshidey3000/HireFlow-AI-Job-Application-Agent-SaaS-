"use server"

import { revalidatePath } from "next/cache"
import type Stripe from "stripe"

import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/helpers"
import { getAuthenticatedSupabase } from "@/lib/auth/session"
import { getSiteUrl } from "@/lib/auth/url"
import { getStripe } from "@/lib/stripe/client"
import { getPlanConfig, isUnlimited, PLANS, type PlanConfig, type PlanId } from "@/lib/stripe/config"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  BillingHistoryItem,
  UserDailyUsage,
  UserSubscription,
} from "@/lib/supabase/database.types"

export interface SubscriptionAndUsageData {
  subscription: UserSubscription
  plan: PlanConfig
  usage: {
    usedToday: number
    limit: number
    remainingToday: number
    isUnlimited: boolean
    usageDate: string
  }
  invoices: BillingHistoryItem[]
  isStripeConfigured: boolean
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

/**
 * Fetch current user's subscription, daily usage, and billing history.
 */
export async function getUserSubscriptionAndUsage(): Promise<
  ActionResult<SubscriptionAndUsageData>
> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const today = getTodayDateString()

    // 1. Fetch user subscription
    let { data: sub } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    // If no subscription record exists yet, create or return default Free plan
    if (!sub) {
      const { data: newSub, error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: "free",
          plan_name: "Free",
          plan_limit: 5,
          status: "active",
          payment_status: "paid",
        })
        .select("*")
        .single()

      if (!insertError && newSub) {
        sub = newSub
      } else {
        // Fallback in-memory representation
        sub = {
          id: "default-free",
          user_id: userId,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          plan_id: "free",
          plan_name: "Free",
          plan_limit: 5,
          status: "active",
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          payment_status: "paid",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
    }

    // 2. Fetch today's usage count
    const { data: usageRow } = await supabase
      .from("user_daily_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("usage_date", today)
      .maybeSingle()

    const usedToday = usageRow?.ai_apply_count ?? 0
    const plan = getPlanConfig(sub.plan_id)
    const unlimited = isUnlimited(sub.plan_limit)
    const remainingToday = unlimited ? -1 : Math.max(0, sub.plan_limit - usedToday)

    // 3. Fetch billing invoices history
    const { data: invoices } = await supabase
      .from("billing_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    return actionSuccess({
      subscription: sub,
      plan,
      usage: {
        usedToday,
        limit: sub.plan_limit,
        remainingToday,
        isUnlimited: unlimited,
        usageDate: today,
      },
      invoices: invoices || [],
      isStripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    })
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to load subscription information."
    )
  }
}

/**
 * Create a Stripe Checkout Session for subscribing or upgrading.
 * Conforms to requirements: No hardcoded Stripe Price IDs. Generates recurring price_data on the fly.
 */
export async function createCheckoutSession(
  planId: "pro" | "unlimited"
): Promise<ActionResult<{ url: string }>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const { data: authData } = await supabase.auth.getUser()
    const userEmail = authData.user?.email
    const plan = getPlanConfig(planId)

    if (plan.id === "free") {
      return actionError("Free plan does not require checkout.")
    }

    // If STRIPE_SECRET_KEY is not set in development, provide dev sandbox upgrade
    if (!process.env.STRIPE_SECRET_KEY) {
      const now = new Date()
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      await supabase.from("user_subscriptions").upsert(
        {
          user_id: userId,
          plan_id: plan.id,
          plan_name: plan.name,
          plan_limit: plan.limit,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: nextMonth.toISOString(),
          cancel_at_period_end: false,
          payment_status: "paid",
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      )

      await supabase.from("billing_history").insert({
        user_id: userId,
        stripe_invoice_id: `inv_dev_${Date.now()}`,
        amount_paid: plan.priceInCents,
        currency: "usd",
        status: "paid",
        invoice_pdf: null,
        hosted_invoice_url: null,
      })

      revalidatePath("/dashboard/billing")
      revalidatePath("/dashboard/jobs")
      revalidatePath("/dashboard/application-status")

      const appUrl = getSiteUrl()

      return actionSuccess({
        url: `${appUrl}/dashboard/billing?success=true&dev_sandbox=true`,
      })
    }

    const stripe = getStripe()

    // Get current subscription to reuse Stripe customer if present
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle()

    let customerId = sub?.stripe_customer_id

    // If no customer ID exists, create one in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail || undefined,
        metadata: {
          userId,
        },
      })
      customerId = customer.id

      await supabase
        .from("user_subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", userId)
    }

    const appUrl = getSiteUrl()

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `HireFlow ${plan.name} Plan`,
              description: plan.description,
            },
            unit_amount: plan.priceInCents,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planId: plan.id,
        planName: plan.name,
        planLimit: plan.limit.toString(),
      },
      subscription_data: {
        metadata: {
          userId,
          planId: plan.id,
          planName: plan.name,
          planLimit: plan.limit.toString(),
        },
      },
      success_url: `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    })

    if (!session.url) {
      return actionError("Failed to create Stripe Checkout URL.")
    }

    return actionSuccess({ url: session.url })
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to initiate Stripe Checkout."
    )
  }
}

/**
 * Create a Stripe Customer Billing Portal Session for managing existing subscriptions.
 */
export async function createCustomerPortalSession(): Promise<ActionResult<{ url: string }>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()

    if (!process.env.STRIPE_SECRET_KEY) {
      // Dev sandbox: reset to Free plan
      await supabase.from("user_subscriptions").upsert(
        {
          user_id: userId,
          plan_id: "free",
          plan_name: "Free",
          plan_limit: 5,
          status: "active",
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      revalidatePath("/dashboard/billing")
      const appUrl = getSiteUrl()
      return actionSuccess({ url: `${appUrl}/dashboard/billing?portal_reset=true` })
    }

    const stripe = getStripe()

    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (!sub?.stripe_customer_id) {
      return actionError("No active Stripe customer found for this account.")
    }

    const appUrl = getSiteUrl()

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/dashboard/billing`,
    })

    return actionSuccess({ url: portalSession.url })
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to create Stripe Portal session."
    )
  }
}

/**
 * Verify and synchronize subscription directly when returning from Stripe Checkout.
 */
export async function syncCheckoutSession(
  sessionId: string
): Promise<ActionResult<{ planName: string }>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    })

    if (session.metadata?.userId && session.metadata.userId !== userId) {
      return actionError("Session does not belong to the current user.")
    }

    const planId = (session.metadata?.planId as PlanId) || "pro"
    const plan = getPlanConfig(planId)
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id || null

    let subscriptionId: string | null = null
    let status: UserSubscription["status"] = "active"
    let currentPeriodStart: string | null = null
    let currentPeriodEnd: string | null = null
    let cancelAtPeriodEnd = false

    if (session.subscription) {
      const subscriptionObj =
        typeof session.subscription === "string"
          ? await stripe.subscriptions.retrieve(session.subscription)
          : (session.subscription as Stripe.Subscription)

      subscriptionId = subscriptionObj.id
      status = (subscriptionObj.status as UserSubscription["status"]) || "active"
      const item = subscriptionObj.items?.data?.[0]
      const startSec =
        item?.current_period_start ?? (subscriptionObj as unknown as { current_period_start?: number }).current_period_start
      const endSec =
        item?.current_period_end ?? (subscriptionObj as unknown as { current_period_end?: number }).current_period_end

      currentPeriodStart = startSec ? new Date(startSec * 1000).toISOString() : null
      currentPeriodEnd = endSec ? new Date(endSec * 1000).toISOString() : null
      cancelAtPeriodEnd = subscriptionObj.cancel_at_period_end
    }

    // Upsert subscription in database
    const { error: upsertError } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_id: plan.id,
          plan_name: plan.name,
          plan_limit: plan.limit,
          status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (upsertError) throw upsertError

    revalidatePath("/dashboard/billing")
    revalidatePath("/dashboard/jobs")
    revalidatePath("/dashboard/application-status")

    return actionSuccess({ planName: plan.name })
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Could not synchronize checkout session."
    )
  }
}

/**
 * Validate user daily usage and increment if allowed.
 * Used before launching AI Auto-Apply.
 */
export async function validateAndIncrementDailyUsage(userId: string): Promise<{
  allowed: boolean
  usedToday: number
  limit: number
  planName: string
  planId: string
  errorMessage?: string
}> {
  const adminSupabase = createAdminClient()
  const today = getTodayDateString()

  // 1. Fetch user's subscription
  const { data: sub } = await adminSupabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  const planId = sub?.plan_id || "free"
  const planName = sub?.plan_name || "Free"
  const planLimit = sub?.status === "active" ? sub.plan_limit : 5 // Fallback to 5 if inactive

  // 2. Fetch today's usage
  const { data: usageRow } = await adminSupabase
    .from("user_daily_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle()

  const currentCount = usageRow?.ai_apply_count ?? 0

  // 3. Check limit
  if (!isUnlimited(planLimit) && currentCount >= planLimit) {
    let errorMsg = `Daily AI application limit reached (${currentCount}/${planLimit}).`
    if (planId === "free") {
      errorMsg = "You have used your 5 free AI applications today. Upgrade to Pro (25/day) or Unlimited to apply to more jobs."
    } else if (planId === "pro") {
      errorMsg = "You have reached your daily Pro limit of 25 applications. Upgrade to Unlimited for unrestricted automated applies."
    }

    return {
      allowed: false,
      usedToday: currentCount,
      limit: planLimit,
      planName,
      planId,
      errorMessage: errorMsg,
    }
  }

  // 4. Increment count in DB
  const nextCount = currentCount + 1
  await adminSupabase.from("user_daily_usage").upsert(
    {
      user_id: userId,
      usage_date: today,
      ai_apply_count: nextCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,usage_date" }
  )

  return {
    allowed: true,
    usedToday: nextCount,
    limit: planLimit,
    planName,
    planId,
  }
}
