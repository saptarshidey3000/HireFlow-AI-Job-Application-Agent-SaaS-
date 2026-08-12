"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { NAV_LINKS } from "@/components/landing/constants"
import { LiquidGlassButton } from "@/components/landing/shared"
import { cn } from "@/lib/utils"

export function Navbar({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const ctaHref = isAuthenticated ? "/dashboard" : "/signup"
  const ctaLabel = isAuthenticated ? "Dashboard" : "Get Started"

  return (
    <>
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight text-white md:text-3xl"
        >
          HireFlow
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#A7A7A7] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <LiquidGlassButton href={ctaHref}>{ctaLabel}</LiquidGlassButton>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-10 items-center justify-center rounded-md text-white md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/90 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex flex-col gap-6 px-8 pt-28">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-lg text-[#A7A7A7] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <LiquidGlassButton
            href={ctaHref}
            className="mt-4 w-full text-center"
            onClick={() => setMobileOpen(false)}
          >
            {ctaLabel}
          </LiquidGlassButton>
        </div>
      </div>
    </>
  )
}
