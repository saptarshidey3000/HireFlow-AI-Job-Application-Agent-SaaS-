import { SectionHeading } from "@/components/landing/shared"

const applications = [
  { role: "Frontend Engineer", status: "Interview", color: "text-[#3FA98A]" },
  { role: "Software Engineer", status: "Applied", color: "text-[#A7A7A7]" },
  { role: "React Developer", status: "Screening", color: "text-[#D6A84F]" },
  { role: "Full Stack Engineer", status: "Saved", color: "text-[#707070]" },
  { role: "AI Engineer", status: "Offer", color: "text-[#3FA98A]" },
]

export function ApplicationPreview() {
  return (
    <section className="bg-[#001a2e] px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <div className="landing-glass-card rounded-2xl p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-[#333333]/50 pb-4">
                <h3 className="text-sm font-medium text-white">Applications</h3>
                <span className="text-xs text-[#707070]">5 active</span>
              </div>

              <div className="space-y-1">
                {applications.map((app) => (
                  <div
                    key={app.role}
                    className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="text-sm text-white">{app.role}</span>
                    <span className={`text-xs font-medium ${app.color}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading>
              Your entire pipeline,
              <br />
              <span className="text-[#A7A7A7]">in one view.</span>
            </SectionHeading>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#A7A7A7]">
              HireFlow is a full application-management platform — not merely an
              AI chatbot. Track every role from discovery to offer in a premium
              workspace built for serious job seekers.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
