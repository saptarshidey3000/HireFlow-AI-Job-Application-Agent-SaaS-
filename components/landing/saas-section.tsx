import { Check } from "lucide-react"

import { LiquidGlassButton, SectionHeading, SectionLabel } from "@/components/landing/shared"

const benefits = [
  "Subscription plans that scale with your search",
  "Usage limits and AI usage tracking",
  "Personalized workspaces for every job seeker",
  "Scalable SaaS infrastructure you can trust",
]

export function SaasSection() {
  return (
    <section id="pricing" className="bg-[#001a2e] px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionLabel>Built for serious job seekers</SectionLabel>
            <SectionHeading className="mt-4">
              Built to scale
              <br />
              <span className="text-[#A7A7A7]">with your job search.</span>
            </SectionHeading>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#A7A7A7]">
              Whether you&apos;re applying to a handful of roles or running a
              full-scale search, HireFlow grows with you — from free exploration
              to power-user workflows.
            </p>
          </div>

          <div className="landing-glass-card rounded-2xl p-8">
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0D3B2E]/60">
                    <Check className="size-3 text-[#3FA98A]" />
                  </div>
                  <span className="text-sm leading-relaxed text-[#A7A7A7]">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-[#333333]/50 pt-8">
              <p className="text-sm text-[#707070]">
                Sign in with Google or email. No unnecessary providers.
              </p>
              <div className="mt-4">
                <LiquidGlassButton href="/signup">
                  Create Your Workspace
                </LiquidGlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
