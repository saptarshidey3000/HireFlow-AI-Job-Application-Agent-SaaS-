import Link from "next/link"

import { MarketingPanel } from "@/components/auth/marketing-panel"

export function AuthLayout({
  children,
  activeStep = 1,
}: {
  children: React.ReactNode
  activeStep?: number
}) {
  return (
    <div
      className="flex min-h-full flex-1 items-center justify-center p-4 md:p-8"
      style={{
        background: `
          radial-gradient(circle at 75% 60%, rgba(43, 138, 112, 0.45) 0%, rgba(13, 59, 46, 0.25) 30%, rgba(0, 0, 0, 0) 65%),
          #0D3B2E
        `,
      }}
    >
      <div className="w-full max-w-[1050px] overflow-hidden rounded-sm border border-black/40 bg-black p-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <div className="grid min-h-[640px] grid-cols-1 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <MarketingPanel activeStep={activeStep} />
          </div>
          <div className="order-1 flex items-center justify-center bg-black px-6 py-10 md:order-2 md:px-10 md:py-12">
            <div className="w-full max-w-[340px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string
  linkText: string
  href: string
}) {
  return (
    <p className="mt-6 text-center text-sm text-[#A7A7A7]">
      {text}{" "}
      <Link
        href={href}
        className="font-medium text-[#3FA98A] transition-colors hover:text-white"
      >
        {linkText}
      </Link>
    </p>
  )
}
