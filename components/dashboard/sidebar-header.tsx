"use client"

import Link from "next/link"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SidebarHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        collapsed ? "flex-col px-2" : "justify-between px-3"
      )}
    >
      <Link
        href="/dashboard"
        className={cn(
          "font-display text-white transition-opacity duration-150 ease-in-out hover:opacity-80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8A70]/30",
          collapsed ? "text-lg tracking-tight" : "text-2xl tracking-tight"
        )}
        aria-label="Hire Flow dashboard home"
      >
        {collapsed ? "HF" : "Hire Flow."}
      </Link>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "shrink-0 rounded-lg border border-transparent text-[#A7A7A7]",
          "hover:border-[#333333] hover:bg-[#242424] hover:text-white",
          collapsed && "mt-1"
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </Button>
    </div>
  )
}
