import { SectionHeading } from "@/components/landing/shared"

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "Find relevant jobs across multiple platforms.",
  },
  {
    number: "02",
    title: "Analyze",
    description: "AI identifies requirements, skills, and keywords.",
  },
  {
    number: "03",
    title: "Tailor",
    description: "Generate job-specific resume and application improvements.",
  },
  {
    number: "04",
    title: "Apply & Track",
    description: "Manage applications and track their progress from one workspace.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#001a2e] px-6 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading className="max-w-3xl">
          From job discovery to application,
          <br />
          <span className="text-[#A7A7A7]">without the chaos.</span>
        </SectionHeading>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="landing-glass-card rounded-xl p-6 md:p-8"
            >
              <span className="font-display text-3xl text-[#3FA98A]">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-medium text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#A7A7A7]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-[#707070]">
          {["Discover", "Analyze", "Tailor", "Apply", "Track"].map((step, i) => (
            <span key={step} className="flex items-center gap-3">
              <span className="text-[#A7A7A7]">{step}</span>
              {i < 4 && <span className="text-[#333333]">→</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
