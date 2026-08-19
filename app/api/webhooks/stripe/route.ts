import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { getStripe } from "@/lib/stripe/client"
import { getPlanConfig, type PlanId } from "@/lib/stripe/config"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserSubscription } from "@/lib/supabase/database.types"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripe = getStripe()

  let event: Stripe.Event

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Allow parsed JSON event in development if webhook secret is not configured
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed"
    console.error(`[Stripe Webhook Error]: ${message}`)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const userId =
          session.metadata?.userId ||
          (session.client_reference_id as string)

        if (!userId) {
          console.warn("[Stripe Webhook] No userId in checkout session metadata")
          break
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

        await supabase.from("user_subscriptions").upsert(
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

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id

        if (!customerId) break

        const status = (subscription.status as UserSubscription["status"]) || "active"
        const item = subscription.items?.data?.[0]
        const startSec =
          item?.current_period_start ?? (subscription as unknown as { current_period_start?: number }).current_period_start
        const endSec =
          item?.current_period_end ?? (subscription as unknown as { current_period_end?: number }).current_period_end

        const currentPeriodStart = startSec ? new Date(startSec * 1000).toISOString() : null
        const currentPeriodEnd = endSec ? new Date(endSec * 1000).toISOString() : null
        const cancelAtPeriodEnd = subscription.cancel_at_period_end

        // Check if plan metadata was changed
        const planId = (subscription.metadata?.planId as PlanId) || null
        const updatePayload: Partial<UserSubscription> = {
          stripe_subscription_id: subscription.id,
          status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
          updated_at: new Date().toISOString(),
        }

        if (planId) {
          const plan = getPlanConfig(planId)
          updatePayload.plan_id = plan.id
          updatePayload.plan_name = plan.name
          updatePayload.plan_limit = plan.limit
        }

        await supabase
          .from("user_subscriptions")
          .update(updatePayload)
          .eq("stripe_customer_id", customerId)

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id

        if (!customerId) break

        // Revert user to default Free plan
        await supabase
          .from("user_subscriptions")
          .update({
            plan_id: "free",
            plan_name: "Free",
            plan_limit: 5,
            status: "canceled",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id

        if (!customerId) break

        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (sub?.user_id) {
          await supabase.from("billing_history").insert({
            user_id: sub.user_id,
            stripe_invoice_id: invoice.id,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            status: "paid",
            invoice_pdf: invoice.invoice_pdf || null,
            hosted_invoice_url: invoice.hosted_invoice_url || null,
          })

          await supabase
            .from("user_subscriptions")
            .update({ payment_status: "paid", updated_at: new Date().toISOString() })
            .eq("user_id", sub.user_id)
        }

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id

        if (!customerId) break

        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (sub?.user_id) {
          await supabase.from("billing_history").insert({
            user_id: sub.user_id,
            stripe_invoice_id: invoice.id,
            amount_paid: invoice.amount_due,
            currency: invoice.currency,
            status: "failed",
            invoice_pdf: invoice.invoice_pdf || null,
            hosted_invoice_url: invoice.hosted_invoice_url || null,
          })

          await supabase
            .from("user_subscriptions")
            .update({
              payment_status: "failed",
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", sub.user_id)
        }

        break
      }

      default:
        // Other events ignored safely
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[Stripe Webhook Processing Error]:", err)
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    )
  }
}
