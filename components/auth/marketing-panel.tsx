"use client"

import { cn } from "@/lib/utils"

const steps = [
  { number: 1, title: "Create your\naccount", active: true },
  { number: 2, title: "Set up your\nworkspace", active: false },
  { number: 3, title: "Build your\nprofile", active: false },
]

export function MarketingPanel({ activeStep = 1 }: { activeStep?: number }) {
  return (
    <div
      className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-sm p-8 md:min-h-full md:p-10 lg:p-12"
      style={{
        background: `
          radial-gradient(circle at 85% 70%, rgba(63, 169, 138, 0.55), transparent 40%),
          linear-gradient(135deg, #145A46, #0D3B2E 55%, #08251E)
        `,
      }}
    >
      <div className="relative z-10">
        <p className="text-xs font-medium uppercase tracking-widest text-white/60">
          HireFlow
        </p>
        <h1 className="mt-4 max-w-xs text-3xl font-semibold leading-tight text-white md:text-4xl">
          Get Started
          <br />
          with HireFlow
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          Complete these easy steps to get your HireFlow workspace ready.
        </p>
      </div>

      <div className="relative z-10 mt-10 grid grid-cols-3 gap-3 md:mt-0">
        {steps.map((step) => {
          const isActive = step.number === activeStep
          return (
            <div
              key={step.number}
              className={cn(
                "rounded-lg p-3 transition-all duration-150 md:p-4",
                isActive
                  ? "bg-white text-[#1C1C1C]"
                  : "border border-transparent bg-white/10 text-white/70 hover:bg-white/15"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold",
                    isActive ? "bg-[#0D3B2E] text-white" : "bg-white/20 text-white"
                  )}
                >
                  {step.number}
                </span>
              </div>
              <p className="whitespace-pre-line text-xs leading-snug font-medium md:text-sm">
                {step.title}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
