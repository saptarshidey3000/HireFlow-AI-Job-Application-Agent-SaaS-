import { redirect } from "next/navigation"

import { BillingPageClient } from "@/components/billing/billing-page-client"
import { getUserSubscriptionAndUsage } from "@/lib/actions/billing"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function BillingPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub as string | undefined

  if (!userId) {
    redirect("/login")
  }

  const result = await getUserSubscriptionAndUsage()

  if (!result.success) {
    return (
      <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(32,32,32,0.5)] p-8 text-center text-white">
        <h2 className="text-xl font-bold">Failed to load billing information</h2>
        <p className="mt-2 text-xs text-[#A7A7A7]">
          {result.error || "Please refresh or try again later."}
        </p>
      </div>
    )
  }

  return <BillingPageClient initialData={result.data} />
}
