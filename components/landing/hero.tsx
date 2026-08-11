import { HERO_VIDEO_URL } from "@/components/landing/constants"
import { LiquidGlassButton } from "@/components/landing/shared"

export function Hero() {
  return (
    <div id="home" className="relative min-h-screen overflow-hidden" aria-label="Hero">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-32 pb-40 text-center">
        <p className="animate-fade-rise text-xs font-medium uppercase tracking-[0.2em] text-[#A7A7A7]">
          AI-POWERED JOB APPLICATIONS
        </p>

        <h1 className="animate-fade-rise-delay font-display mt-6 max-w-6xl text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-white sm:text-7xl md:text-8xl">
          Your next job application,
          <br />
          <span className="text-[#A7A7A7]">intelligently handled.</span>
        </h1>

        <p className="animate-fade-rise-delay-2 mt-8 max-w-2xl text-base leading-relaxed text-[#A7A7A7] sm:text-lg">
          HireFlow uses AI to analyze jobs, tailor your resume, score your fit,
          discover opportunities, and manage every application from one intelligent
          workspace.
        </p>

        <div className="animate-fade-rise-delay-3 mt-12 flex flex-col items-center gap-4">
          <LiquidGlassButton href="/signup" size="lg">
            Start Applying Smarter
          </LiquidGlassButton>

          <a
            href="#how-it-works"
            className="text-sm text-[#A7A7A7] transition-colors hover:text-white"
          >
            Explore how it works →
          </a>

          <p className="mt-4 text-xs tracking-wide text-[#707070]">
            Analyze · Tailor · Match · Discover · Track
          </p>
        </div>
      </div>
    </div>
  )
}
