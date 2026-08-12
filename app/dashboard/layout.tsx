import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getOnboardingStatus } from "@/lib/data/onboarding"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardRootLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect("/login")
  }

  const userId = data.claims.sub as string
  const onboarding = await getOnboardingStatus(supabase, userId)

  return (
    <DashboardLayout onboarding={onboarding}>{children}</DashboardLayout>
  )
}
