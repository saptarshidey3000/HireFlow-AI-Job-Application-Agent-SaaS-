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
      className="mt-8 h-9 rounded-md border-[#333333] bg-[#242424] text-[#A7A7A7] hover:border-[#404040] hover:bg-[#2D2D2D] hover:text-white"
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
