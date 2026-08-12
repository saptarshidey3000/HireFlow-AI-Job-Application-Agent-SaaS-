"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { OnboardingStatus } from "@/lib/supabase/database.types"

import { DashboardHeader } from "./dashboard-header"
import { MobileSidebar } from "./mobile-sidebar"
import { Sidebar } from "./sidebar"
import { useSidebarState } from "./use-sidebar-state"

export function DashboardLayout({
  children,
  onboarding,
}: {
  children: React.ReactNode
  onboarding: OnboardingStatus
}) {
  const pathname = usePathname()
  const { collapsed, hydrated, toggleCollapsed } = useSidebarState()
  const [mobileOpen, setMobileOpen] = useState(false)
  const showOnboarding = !onboarding.isComplete

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <TooltipProvider delay={200}>
      <div className="flex min-h-screen bg-[#1C1C1C]">
        <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block">
          <Sidebar
            collapsed={collapsed}
            hydrated={hydrated}
            onToggle={toggleCollapsed}
          />
        </div>

        <MobileSidebar
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          hydrated={hydrated}
          onToggle={toggleCollapsed}
        />

        <div
          className={cn(
            "flex min-h-screen min-w-0 flex-1 flex-col transition-[margin-left] duration-200 ease-in-out motion-reduce:transition-none",
            hydrated && collapsed ? "md:ml-[76px]" : "md:ml-[260px]"
          )}
        >
          <DashboardHeader onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>

      {showOnboarding ? <OnboardingDialog open={showOnboarding} /> : null}
    </TooltipProvider>
  )
}
