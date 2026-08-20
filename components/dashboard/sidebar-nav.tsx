"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { type NavItem } from "./navigation"

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  const linkClassName = cn(
    "group relative flex items-center rounded-md font-semibold transition-all duration-120 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fa98a]/50",
    collapsed ? "size-10 justify-center px-0" : "h-10 gap-3 px-3 py-2",
    active
      ? "border-2 border-[#2b8a70] bg-[#0d3b2e] text-white shadow-[3px_3px_0px_0px_#000000]"
      : "border-2 border-transparent text-[#A7A7A7] hover:border-[#384843] hover:bg-[#1a1a1a] hover:text-white hover:shadow-[2px_2px_0px_0px_#000000]"
  )

  const linkContent = (
    <>
      <Icon className={cn("size-[18px] shrink-0", active ? "text-[#3FA98A]" : "text-[#707070] group-hover:text-white")} />
      {!collapsed && (
        <span className="truncate text-sm font-semibold tracking-tight">{item.label}</span>
      )}
    </>
  )

  if (!collapsed) {
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={linkClassName}
      >
        {linkContent}
      </Link>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={linkClassName}
          />
        }
      >
        {linkContent}
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={8}
        className="border-2 border-[#2b8a70] bg-[#141414] font-semibold text-white shadow-[3px_3px_0px_0px_#000000]"
      >
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

export function SidebarNav({
  items,
  collapsed,
}: {
  items: NavItem[]
  collapsed: boolean
}) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink key={item.href} item={item} collapsed={collapsed} />
      ))}
    </nav>
  )
}
