import { redirect } from "next/navigation"

import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect("/login")
  }

  const userId = data.claims.sub as string
  const email = (data.claims.email as string) ?? ""

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single()

  return (
    <div
      className="min-h-full flex-1"
      style={{
        background: `
          radial-gradient(circle at 70% 50%, rgba(43, 138, 112, 0.18), transparent 45%),
          #1C1C1C
        `,
      }}
    >
      <DashboardContent email={email} fullName={profile?.full_name} />
    </div>
  )
}
