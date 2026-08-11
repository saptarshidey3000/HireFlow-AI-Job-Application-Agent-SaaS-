import { MapPin, Clock } from "lucide-react"

import { SectionHeading } from "@/components/landing/shared"

const jobs = [
  {
    title: "Senior Frontend Engineer",
    company: "TechCorp",
    location: "Remote",
    match: "94%",
    posted: "2d ago",
  },
  {
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "San Francisco",
    match: "88%",
    posted: "1d ago",
  },
  {
    title: "React Developer",
    company: "Digital Agency",
    location: "Hybrid",
    match: "91%",
    posted: "3d ago",
  },
  {
    title: "AI Engineer",
    company: "AI Labs",
    location: "Remote",
    match: "86%",
    posted: "5d ago",
  },
]

export function JobDiscovery() {
  return (
    <section className="bg-[#001422] px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading>
              Every opportunity.
              <br />
              <span className="text-[#A7A7A7]">One place.</span>
            </SectionHeading>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#A7A7A7]">
              Stop jumping between job platforms. HireFlow helps you discover,
              organize, and manage relevant opportunities through a single
              workflow.
            </p>
          </div>

          <div className="landing-glass-card rounded-2xl p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Discovered Jobs</h3>
              <span className="rounded-full bg-[#0D3B2E]/60 px-3 py-1 text-xs text-[#3FA98A]">
                4 new matches
              </span>
            </div>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.title}
                  className="rounded-lg border border-[#333333]/50 bg-black/30 p-4 transition-colors hover:border-[#2B8A70]/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{job.title}</p>
                      <p className="mt-1 text-sm text-[#A7A7A7]">{job.company}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#0D3B2E]/60 px-2.5 py-1 text-xs font-medium text-[#3FA98A]">
                      {job.match}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-[#707070]">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {job.posted}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
