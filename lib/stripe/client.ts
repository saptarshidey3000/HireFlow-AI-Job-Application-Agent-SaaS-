import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured in environment variables. Please add it to .env.local"
    )
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
      appInfo: {
        name: "HireFlow AI Job Application SaaS",
        version: "0.1.0",
      },
    })
  }

  return stripeInstance
}
