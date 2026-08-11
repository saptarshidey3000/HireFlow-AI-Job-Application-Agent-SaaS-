import Link from "next/link"

import { cn } from "@/lib/utils"

type LiquidGlassButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
  size?: "sm" | "lg"
  onClick?: () => void
}

export function LiquidGlassButton({
  href,
  children,
  className,
  size = "sm",
  onClick,
}: LiquidGlassButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "liquid-glass inline-flex items-center justify-center rounded-full text-white transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8A70]/50",
        size === "sm" && "px-6 py-2.5 text-sm font-medium",
        size === "lg" && "px-14 py-5 text-base font-medium",
        className
      )}
    >
      {children}
    </Link>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#A7A7A7]">
      {children}
    </p>
  )
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        "font-display text-3xl font-normal leading-tight tracking-tight text-white sm:text-4xl md:text-5xl",
        className
      )}
    >
      {children}
    </h2>
  )
}
