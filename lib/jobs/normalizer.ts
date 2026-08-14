import type {
  JobSearchResult,
  JobType,
  JobTypeFilter,
  NormalizedJobInput,
  WorkMode,
  WorkModeFilter,
} from "@/lib/jobs/types"

function extractJobTitle(title: string): string {
  const dashParts = title.split(/\s[-–|]\s/)
  if (dashParts.length > 1) {
    return dashParts[0].replace(/\bat\s+.+$/i, "").trim()
  }
  return title.trim()
}

export function normalizeJobType(text: string): JobType {
  const lower = text.toLowerCase()
  if (/\bintern(ship)?\b/.test(lower)) return "internship"
  if (/\bpart[-\s]?time\b/.test(lower)) return "part-time"
  if (/\bfull[-\s]?time\b/.test(lower)) return "full-time"
  if (/\bcontract\b|\bfreelance\b/.test(lower)) return "contract"
  return "unknown"
}

export function normalizeWorkMode(text: string): WorkMode {
  const lower = text.toLowerCase()
  if (/\bon[-\s]?campus\b/.test(lower)) return "on-campus"
  if (/\bhybrid\b/.test(lower)) return "hybrid"
  if (/\bremote\b|\bwork from home\b|\bwfh\b/.test(lower)) return "remote"
  if (/\bonsite\b|\bon-site\b|\bin-office\b|\bin office\b/.test(lower))
    return "onsite"
  return "unknown"
}

export function extractSalary(text: string): string | undefined {
  const match = text.match(
    /\$[\d,]+(?:k|K)?(?:\s*[-–]\s*\$?[\d,]+(?:k|K)?)?|\b[\d,]+(?:k|K)\s*[-–]\s*[\d,]+(?:k|K)\b|\b₹[\d,.]+(?:\s*[-–]\s*₹[\d,.]+)?/i
  )
  return match?.[0]
}

export function extractLocation(text: string): string | undefined {
  const match = text.match(
    /\b(remote|hybrid|on campus|india|bengaluru|bangalore|mumbai|delhi|hyderabad|pune|chennai|san francisco|new york|london|austin|seattle|toronto|berlin|singapore)[^,.|]*/i
  )
  return match?.[0]?.trim()
}

export function extractExperienceLevel(text: string): string | undefined {
  const match = text.match(
    /\b(entry[-\s]?level|junior|mid[-\s]?level|senior|lead|principal|intern|graduate|fresher)\b/i
  )
  return match?.[0]
}

export function extractTags(text: string, knownSkills: string[]): string[] {
  const lower = text.toLowerCase()
  const found = knownSkills.filter((skill) =>
    lower.includes(skill.toLowerCase())
  )

  return Array.from(new Set(found)).slice(0, 6)
}

export function normalizeSearchResult(
  result: JobSearchResult
): NormalizedJobInput {
  const combined = `${result.title} ${result.snippet}`

  return {
    platform: result.platform === "unknown" ? result.source.toLowerCase() : result.platform,
    title: extractJobTitle(result.title),
    company: result.company,
    location: extractLocation(combined),
    salary: extractSalary(combined),
    description: result.snippet,
    job_url: result.url,
    source_url: result.url,
  }
}

export function jobMatchesFilters(
  jobType: JobType | null,
  workMode: WorkMode | null,
  jobTypes: JobTypeFilter[],
  workModes: WorkModeFilter[]
): boolean {
  if (jobTypes.length > 0 && jobType && jobType !== "unknown") {
    if (!jobTypes.includes(jobType as JobTypeFilter)) return false
  }

  if (workModes.length > 0 && workMode && workMode !== "unknown") {
    const modeMap: Record<WorkModeFilter, WorkMode[]> = {
      remote: ["remote"],
      hybrid: ["hybrid"],
      "on-campus": ["on-campus"],
    }
    const allowed = workModes.flatMap((mode) => modeMap[mode])
    if (!allowed.includes(workMode)) return false
  }

  return true
}

export function enrichNormalizedJob(
  input: NormalizedJobInput,
  knownSkills: string[]
): NormalizedJobInput & {
  job_type: JobType
  work_mode: WorkMode
  experience_level?: string
  tags: string[]
} {
  const combined = `${input.title} ${input.description ?? ""} ${input.location ?? ""}`
  return {
    ...input,
    job_type: normalizeJobType(combined),
    work_mode: normalizeWorkMode(combined),
    experience_level: extractExperienceLevel(combined),
    tags: extractTags(combined, knownSkills),
  }
}
