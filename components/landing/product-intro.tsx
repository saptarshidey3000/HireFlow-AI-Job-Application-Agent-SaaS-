import { SectionHeading } from "@/components/landing/shared"

export function ProductIntro() {
  return (
    <section className="bg-[#001a2e] px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <SectionHeading>
          Stop managing your job search.
          <br />
          <span className="text-[#A7A7A7]">Start running it.</span>
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#A7A7A7] sm:text-lg">
          HireFlow brings job discovery, AI analysis, resume tailoring, matching,
          applications, and analytics into one intelligent workspace.
        </p>
      </div>
    </section>
  )
}
