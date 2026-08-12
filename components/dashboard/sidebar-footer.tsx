"use client"

import { CreditsCard } from "./credits-card"
import { footerNavigation } from "./navigation"
import { SidebarNav } from "./sidebar-nav"

export function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="mt-auto border-t border-[#333333] pt-4">
      <div className={collapsed ? "flex flex-col items-center gap-3" : "space-y-3"}>
        <CreditsCard collapsed={collapsed} />
        <SidebarNav items={footerNavigation} collapsed={collapsed} />
      </div>
    </div>
  )
}
