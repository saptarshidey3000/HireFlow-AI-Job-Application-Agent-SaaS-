import type {
  JobMatchDetails,
  JobType,
  JobTypeFilter,
  ProfileJobContext,
  WorkMode,
  WorkModeFilter,
} from "@/lib/jobs/types"

const WEIGHTS = {
  role: 35,
  skills: 30,
  technology: 20,
  experience: 10,
  location: 5,
} as const

function normalizeTerm(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase()
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 1)
}

function textContainsTerm(text: string, term: string): boolean {
  const normalized = normalizeTerm(term)
  if (!normalized) return false
  if (normalized.includes(" ")) {
    return text.toLowerCase().includes(normalized)
  }
  const pattern = new RegExp(
    `(^|[^a-z0-9+#.])${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9+#.]|$)`,
    "i"
  )
  return pattern.test(text)
}

function overlapRatio(needles: string[], haystackText: string): number {
  if (needles.length === 0) return 0
  const matches = needles.filter((needle) => textContainsTerm(haystackText, needle))
  return matches.length / needles.length
}

function pickCoreSkills(context: ProfileJobContext): string[] {
  const roleTokens = new Set(tokenize(context.role))
  const unique: string[] = []
  const seen = new Set<string>()

  for (const skill of context.skills) {
    const trimmed = skill.trim()
    const key = normalizeTerm(trimmed)
    if (!key || seen.has(key) || roleTokens.has(key)) continue
    seen.add(key)
    unique.push(trimmed)
  }

  return unique.slice(0, 12)
}

function pickTechnologies(context: ProfileJobContext): string[] {
  const skillKeys = new Set(context.skills.map((skill) => normalizeTerm(skill)))
  const unique: string[] = []
  const seen = new Set<string>()

  for (const tech of context.techStack) {
    const trimmed = tech.trim()
    const key = normalizeTerm(trimmed)
    if (!key || seen.has(key) || skillKeys.has(key)) continue
    seen.add(key)
    unique.push(trimmed)
  }

  return unique.slice(0, 10)
}

function scoreRoleMatch(targetRole: string, jobTitle: string): number {
  const roleTokens = tokenize(targetRole).filter((token) => token.length > 2)
  if (roleTokens.length === 0) return 0

  const titleTokens = new Set(tokenize(jobTitle))
  const directMatches = roleTokens.filter((token) => titleTokens.has(token)).length
  const titleText = jobTitle.toLowerCase()
  const phraseMatch = titleText.includes(normalizeTerm(targetRole)) ? 1 : 0

  const tokenRatio = directMatches / roleTokens.length
  return Math.min(1, tokenRatio * 0.75 + phraseMatch * 0.25)
}

function scoreExperienceMatch(
  context: ProfileJobContext,
  jobText: string,
  jobExperienceLevel?: string | null
): { score: number; matched: boolean } {
  const level = context.experienceLevel.toLowerCase()
  const combined = `${jobText} ${jobExperienceLevel ?? ""}`.toLowerCase()

  const entryTerms = ["entry", "junior", "graduate", "fresher", "intern", "0-2"]
  const midTerms = ["mid", "intermediate", "2-5"]
  const seniorTerms = ["senior", "lead", "principal", "staff"]

  let expectedTerms: string[] = []
  if (/entry|junior|graduate|fresher|intern/i.test(level) || context.yearsOfExperience <= 2) {
    expectedTerms = entryTerms
  } else if (/mid/i.test(level) || context.yearsOfExperience <= 6) {
    expectedTerms = midTerms
  } else {
    expectedTerms = seniorTerms
  }

  const matched = expectedTerms.some((term) => combined.includes(term))
  return { score: matched ? 1 : 0.35, matched }
}

function scoreLocationMatch(
  context: ProfileJobContext,
  job: {
    location?: string | null
    work_mode?: WorkMode | null
  },
  filters: { workModes: WorkModeFilter[]; location?: string }
): { score: number; matched: boolean } {
  const prefersRemote =
    context.prefersRemote || filters.workModes.includes("remote")
  const targetLocation = filters.location?.trim() || context.location

  if (prefersRemote && job.work_mode === "remote") {
    return { score: 1, matched: true }
  }

  if (targetLocation && job.location) {
    const matched = job.location.toLowerCase().includes(targetLocation.toLowerCase())
    return { score: matched ? 1 : 0.2, matched }
  }

  if (prefersRemote) {
    const remoteHint = `${job.location ?? ""} ${job.work_mode ?? ""}`.toLowerCase()
    const matched = /\bremote\b|\bwork from home\b|\bwfh\b/.test(remoteHint)
    return { score: matched ? 0.85 : 0.4, matched }
  }

  return { score: 0.5, matched: false }
}

function scoreJobTypeMatch(
  jobType: JobType | null | undefined,
  filters: { jobTypes: JobTypeFilter[] }
): { score: number; matched: boolean } {
  if (filters.jobTypes.length === 0) {
    return { score: 0.6, matched: false }
  }

  if (!jobType || jobType === "unknown") {
    return { score: 0.45, matched: false }
  }

  const matched = filters.jobTypes.includes(jobType as JobTypeFilter)
  return { score: matched ? 1 : 0.15, matched }
}

export function buildMatchReason(
  targetRole: string,
  details: Pick<
    JobMatchDetails,
    "matchedSkills" | "matchedTechnologies" | "experienceMatch" | "locationMatch"
  >
): string {
  const highlights = [...details.matchedSkills, ...details.matchedTechnologies].slice(0, 4)

  if (highlights.length >= 2) {
    const skillList =
      highlights.length === 2
        ? `${highlights[0]} and ${highlights[1]}`
        : `${highlights.slice(0, -1).join(", ")}, and ${highlights[highlights.length - 1]}`

    return `Strong match because this ${targetRole} role references ${skillList}, which align with your profile.`
  }

  if (details.experienceMatch && details.locationMatch) {
    return `Good match for your experience level and location preferences as a ${targetRole}.`
  }

  if (highlights.length === 1) {
    return `Potential match because this role mentions ${highlights[0]}, a skill in your profile.`
  }

  return `Potential match based on your target role of ${targetRole} and profile background. Matching is based on the job title and snippet preview only.`
}

export function calculateResumeMatch(
  targetRole: string,
  context: ProfileJobContext,
  job: {
    title: string
    description?: string | null
    tags?: string[]
    location?: string | null
    job_type?: JobType | null
    work_mode?: WorkMode | null
    experience_level?: string | null
  },
  filters: { jobTypes: JobTypeFilter[]; workModes: WorkModeFilter[]; location?: string }
): { matchScore: number; matchDetails: JobMatchDetails } {
  const jobText = `${job.title} ${job.description ?? ""} ${(job.tags ?? []).join(" ")}`
  const coreSkills = pickCoreSkills(context)
  const technologies = pickTechnologies(context)

  const matchedSkills = coreSkills.filter((skill) => textContainsTerm(jobText, skill))
  const matchedTechnologies = technologies.filter((tech) => textContainsTerm(jobText, tech))

  const missingSkills = coreSkills
    .filter((skill) => !matchedSkills.some((item) => normalizeTerm(item) === normalizeTerm(skill)))
    .slice(0, 4)

  const roleScore = scoreRoleMatch(targetRole, job.title)
  const skillsScore = overlapRatio(coreSkills.slice(0, 8), jobText)
  const techScore =
    technologies.length > 0
      ? overlapRatio(technologies.slice(0, 6), jobText)
      : skillsScore * 0.5

  const experience = scoreExperienceMatch(context, jobText, job.experience_level)
  const location = scoreLocationMatch(context, job, filters)
  const jobType = scoreJobTypeMatch(job.job_type, filters)

  const matchScore = Math.round(
    roleScore * WEIGHTS.role +
      skillsScore * WEIGHTS.skills +
      techScore * WEIGHTS.technology +
      experience.score * WEIGHTS.experience +
      location.score * WEIGHTS.location
  )

  const matchDetails: JobMatchDetails = {
    matchedSkills: matchedSkills.slice(0, 6),
    missingSkills,
    matchedTechnologies: matchedTechnologies.slice(0, 4),
    experienceMatch: experience.matched,
    locationMatch: location.matched,
    jobTypeMatch: jobType.matched,
    matchReason: "",
  }

  matchDetails.matchReason = buildMatchReason(targetRole, matchDetails)

  return {
    matchScore: Math.max(0, Math.min(100, matchScore)),
    matchDetails,
  }
}

/** @deprecated Use calculateResumeMatch instead */
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
  return calculateResumeMatch(context.role, context, job, {
    jobTypes: [],
    workModes: [],
  }).matchScore
}
