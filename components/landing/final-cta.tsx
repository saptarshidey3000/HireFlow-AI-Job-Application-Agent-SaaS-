import Link from "next/link"

import { HERO_VIDEO_URL } from "@/components/landing/constants"
import { LiquidGlassButton, SectionHeading } from "@/components/landing/shared"

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-8">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-40"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <SectionHeading>
          Apply with intention.
          <br />
          <span className="text-[#A7A7A7]">Let AI handle the rest.</span>
        </SectionHeading>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#A7A7A7]">
          Build a smarter job-search workflow with HireFlow.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LiquidGlassButton href="/signup" size="lg">
            Start Your Job Search
          </LiquidGlassButton>
          <Link
            href="#features"
            className="text-sm text-[#A7A7A7] transition-colors hover:text-white"
          >
            Explore Features
          </Link>
        </div>
      </div>
    </section>
  )
}
