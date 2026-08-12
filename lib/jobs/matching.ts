import type { ProfileJobContext } from "@/lib/jobs/types"
import type { JobType, WorkMode } from "@/lib/jobs/types"

const SOURCE_QUALITY: Record<string, number> = {
  greenhouse: 8,
  wellfound: 8,
  linkedin: 7,
  workable: 7,
  indeed: 6,
  internshala: 6,
  upwork: 5,
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 1)
}

function overlapScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setB = new Set(b.map((item) => item.toLowerCase()))
  const matches = a.filter((item) => setB.has(item.toLowerCase())).length
  return matches / Math.max(a.length, b.length)
}

export function calculateMatchScore(
  context: ProfileJobContext,
  job: {
    title: string
    description?: string | null
    tags?: string[]
    location?: string | null
    job_type?: JobType | null
    work_mode?: WorkMode | null
    experience_level?: string | null
    platform?: string | null
  }
): number {
  const jobText = `${job.title} ${job.description ?? ""} ${(job.tags ?? []).join(" ")}`
  const jobTokens = tokenize(jobText)

  let score = 30

  const roleTokens = tokenize(context.role)
  score += overlapScore(roleTokens, jobTokens) * 25

  const skillTokens = context.skills.map((s) => s.toLowerCase())
  const techTokens = context.techStack.map((s) => s.toLowerCase())
  const tagTokens = (job.tags ?? []).map((t) => t.toLowerCase())

  if (skillTokens.length > 0) {
    const skillMatches = skillTokens.filter(
      (skill) =>
        jobText.toLowerCase().includes(skill) || tagTokens.includes(skill)
    ).length
    score += (skillMatches / Math.min(skillTokens.length, 8)) * 20
  }

  if (techTokens.length > 0) {
    const techMatches = techTokens.filter((tech) =>
      jobText.toLowerCase().includes(tech)
    ).length
    score += (techMatches / Math.min(techTokens.length, 6)) * 10
  }

  if (context.location && job.location) {
    if (job.location.toLowerCase().includes(context.location.toLowerCase())) {
      score += 8
    } else if (job.work_mode === "remote" && context.prefersRemote) {
      score += 6
    }
  } else if (job.work_mode === "remote" && context.prefersRemote) {
    score += 6
  }

  if (
    job.experience_level &&
    context.experienceLevel &&
    job.experience_level.toLowerCase().includes(
      context.experienceLevel.split(" ")[0].toLowerCase()
    )
  ) {
    score += 5
  }

  if (job.platform && SOURCE_QUALITY[job.platform]) {
    score += SOURCE_QUALITY[job.platform]
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}
