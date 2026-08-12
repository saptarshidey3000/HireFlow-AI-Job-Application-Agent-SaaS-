"use client"

import { cn } from "@/lib/utils"

import { mainNavigation } from "./navigation"
import { SidebarFooter } from "./sidebar-footer"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNav } from "./sidebar-nav"

export function Sidebar({
  collapsed,
  hydrated,
  onToggle,
  className,
}: {
  collapsed: boolean
  hydrated: boolean
  onToggle: () => void
  className?: string
}) {
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-[#333333]",
        "bg-[rgba(0,0,0,0.78)] backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)]",
        "transition-[width] duration-200 ease-in-out motion-reduce:transition-none",
        collapsed ? "w-[76px]" : "w-[260px]",
        !hydrated && "w-[260px]",
        className
      )}
      aria-label="Dashboard sidebar"
    >
      <div className={cn("py-5", collapsed ? "px-2" : "px-3")}>
        <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col overflow-y-auto overflow-x-hidden",
          collapsed ? "px-2 pb-4" : "px-3 pb-4"
        )}
      >
        <SidebarNav items={mainNavigation} collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  )
}
