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
    "group relative flex items-center rounded-lg transition-all duration-150 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8A70]/30",
    collapsed ? "size-10 justify-center px-0" : "h-11 gap-3 px-3 py-2.5",
    active
      ? "bg-[rgba(13,59,46,0.65)] text-white"
      : "bg-transparent text-[#A7A7A7] hover:bg-[#242424] hover:text-white"
  )

  const linkContent = (
    <>
      {active && (
        <span
          aria-hidden
          className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#3FA98A]"
        />
      )}
      <Icon className="size-[18px] shrink-0" />
      {!collapsed && (
        <span className="truncate text-sm font-medium">{item.label}</span>
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
        className="border border-[#333333] bg-[#242424] text-white"
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
