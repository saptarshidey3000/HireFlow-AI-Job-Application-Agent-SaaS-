"use client"

import { useRouter } from "next/navigation"

import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="mt-8 h-9 text-xs font-bold uppercase tracking-wider"
    >
      Sign out
    </Button>
  )
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center">
      <DashboardEmptyState title="Profile Settings" />
      <SignOutButton />
    </div>
  )
}
