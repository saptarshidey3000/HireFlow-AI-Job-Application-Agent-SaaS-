import {
  BarChart3,
  FileText,
  KanbanSquare,
  ScanSearch,
  Search,
  Target,
  type LucideIcon,
} from "lucide-react"

import { SectionHeading, SectionLabel } from "@/components/landing/shared"

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  highlight?: string
}

const features: Feature[] = [
  {
    icon: ScanSearch,
    title: "AI Job Analysis",
    description:
      "Understand every job before you apply. Extract required skills, qualifications, keywords, and important requirements.",
  },
  {
    icon: FileText,
    title: "AI Resume Tailoring",
    description:
      "Generate job-specific resume improvements based on the role and its requirements.",
  },
  {
    icon: Target,
    title: "Job Match Scoring",
    description:
      "See how strongly your profile matches a job before investing time in the application.",
    highlight: "92% Match",
  },
  {
    icon: KanbanSquare,
    title: "Application Tracking",
    description:
      "Track applications, stages, deadlines, interviews, and outcomes.",
  },
  {
    icon: Search,
    title: "Job Discovery",
    description:
      "Find relevant opportunities based on skills, preferences, target roles, and career goals.",
  },
  {
    icon: BarChart3,
    title: "Application Analytics",
    description:
      "Monitor applications, response rates, interviews, outcomes, and job-search performance.",
  },
]

function FeatureCard({ icon: Icon, title, description, highlight }: Feature) {
  return (
    <div className="landing-glass-card group rounded-xl p-6 transition-colors hover:border-[#2B8A70]/30 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#0D3B2E]/40">
          <Icon className="size-5 text-[#3FA98A]" />
        </div>
        {highlight && (
          <span className="rounded-full bg-[#0D3B2E]/60 px-3 py-1 text-xs font-medium text-[#3FA98A]">
            {highlight}
          </span>
        )}
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#A7A7A7]">{description}</p>
    </div>
  )
}

export function FeatureSection() {
  return (
    <section id="features" className="bg-[#001422] px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <SectionLabel>Everything you need to apply better</SectionLabel>
          <SectionHeading className="mt-4">
            One workspace for your entire job search.
          </SectionHeading>
          <p className="mt-4 text-sm text-[#707070]">
            Multiple job platforms. One place to manage them.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-[#333333]/50 bg-[#0D3B2E]/20 px-6 py-4 text-center">
          <p className="text-sm text-[#A7A7A7]">
            Stages:{" "}
            <span className="text-white">
              Saved → Applied → Screening → Interview → Offer / Rejected
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
