"use client"

import { Menu, Search, Bell, UserRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { pageTitles } from "./navigation"

export function DashboardHeader({
  onOpenMobileNav,
}: {
  onOpenMobileNav?: () => void
}) {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? "Dashboard"

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-[68px] shrink-0 items-center justify-between gap-4",
        "border-b-2 border-[#2d3835] bg-[#111111] px-6",
        "md:px-8 lg:px-10"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {onOpenMobileNav && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="md:hidden"
          >
            <Menu className="size-5" />
          </Button>
        )}
        <h1 className="truncate text-xl font-bold tracking-tight text-white uppercase">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#707070]" />
          <Input
            type="search"
            placeholder="Search"
            aria-label="Search dashboard"
            className="h-9 w-44 pl-9 text-sm lg:w-56"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </Button>

        <Button
          render={
            <Link
              href="/dashboard/settings"
              aria-label="Profile settings"
            />
          }
          variant="outline"
          size="icon-sm"
        >
          <UserRound className="size-4" />
        </Button>
      </div>
    </header>
  )
}
