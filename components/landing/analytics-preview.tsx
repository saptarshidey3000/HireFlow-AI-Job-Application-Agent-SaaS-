import { SectionHeading } from "@/components/landing/shared"

const stats = [
  { label: "Applications", value: "48" },
  { label: "Responses", value: "12" },
  { label: "Interviews", value: "6" },
  { label: "Offers", value: "2" },
]

const rates = [
  { label: "Response Rate", value: "25%" },
  { label: "Interview Rate", value: "12.5%" },
]

const chartBars = [40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95]

export function AnalyticsPreview() {
  return (
    <section className="bg-[#001422] px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading>
              Know what&apos;s working.
              <br />
              <span className="text-[#A7A7A7]">Improve what isn&apos;t.</span>
            </SectionHeading>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#A7A7A7]">
              Monitor applications, response rates, interviews, outcomes, and
              job-search performance with clear analytics that help you optimize
              every step.
            </p>
          </div>

          <div className="landing-glass-card rounded-2xl p-6 md:p-8">
            <h3 className="mb-6 text-sm font-medium text-white">
              Job Search Analytics
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-black/30 p-4">
                  <p className="text-xs text-[#707070]">{stat.label}</p>
                  <p className="mt-1 font-display text-2xl text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {rates.map((rate) => (
                <div
                  key={rate.label}
                  className="rounded-lg border border-[#333333]/50 p-4"
                >
                  <p className="text-xs text-[#707070]">{rate.label}</p>
                  <p className="mt-1 text-lg font-medium text-[#3FA98A]">
                    {rate.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex h-24 items-end gap-1.5">
              {chartBars.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-[#0D3B2E]/60 transition-colors hover:bg-[#2B8A70]/60"
                  style={{ height: `${height}%` }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
