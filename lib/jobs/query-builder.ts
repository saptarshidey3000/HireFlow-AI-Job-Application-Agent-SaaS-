import { createHash } from "crypto"

import { buildSiteRestriction } from "@/lib/jobs/platforms"
import type {
  JobFilters,
  JobPlatform,
  ProfileJobContext,
  WorkModeFilter,
} from "@/lib/jobs/types"

const MAX_QUERY_LENGTH = 420

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function quoteTerm(term: string): string {
  const trimmed = normalizeWhitespace(term)
  if (!trimmed) return ""
  return trimmed.includes(" ") ? `"${trimmed}"` : trimmed
}

function dedupeTerms(terms: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const term of terms) {
    const normalized = normalizeWhitespace(term).toLowerCase()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalizeWhitespace(term))
  }

  return result
}

function buildExperienceClause(context: ProfileJobContext, filters: JobFilters): string | null {
  const level = filters.experienceLevel?.trim() || context.experienceLevel

  if (/entry|junior|graduate|fresher|0-1|1 year/i.test(level)) {
    return '("junior" OR "entry level" OR "graduate")'
  }
  if (/mid/i.test(level)) {
    return '("mid level" OR "intermediate")'
  }
  if (/senior|lead|principal/i.test(level)) {
    return '("senior" OR "lead")'
  }

  if (context.yearsOfExperience <= 1) {
    return '("junior" OR "entry level")'
  }

  return null
}

function buildJobTypeClause(filters: JobFilters): string | null {
  if (filters.jobTypes.length === 0) return null

  const clauses: string[] = []

  if (filters.jobTypes.includes("full-time")) {
    clauses.push('"full time"', '"full-time"')
  }
  if (filters.jobTypes.includes("part-time")) {
    clauses.push('"part time"', '"part-time"')
  }
  if (filters.jobTypes.includes("internship")) {
    clauses.push("internship", "intern")
  }

  const unique = dedupeTerms(clauses)
  if (unique.length === 0) return null
  if (unique.length === 1) return unique[0]
  return `(${unique.join(" OR ")})`
}

function buildWorkModeClause(
  context: ProfileJobContext,
  filters: JobFilters
): string | null {
  const modes = new Set<WorkModeFilter>(filters.workModes)

  if (modes.size === 0 && context.prefersRemote) {
    modes.add("remote")
  }

  if (modes.size === 0) return null

  const clauses: string[] = []

  if (modes.has("remote")) {
    clauses.push('"remote"', '"work from home"')
  }
  if (modes.has("hybrid")) {
    clauses.push("hybrid")
  }
  if (modes.has("on-campus")) {
    clauses.push('"on campus"')
  }

  const unique = dedupeTerms(clauses)
  if (unique.length === 0) return null
  if (unique.length === 1) return unique[0]
  return `(${unique.join(" OR ")})`
}

function selectCoreSkills(context: ProfileJobContext, filters: JobFilters): string[] {
  const roleTokens = new Set(
    context.role.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean)
  )

  const candidates = dedupeTerms([
    ...(filters.skills ?? []),
    ...context.topSkills,
    ...context.techStack,
  ])

  const filtered = candidates.filter((skill) => {
    const lower = skill.toLowerCase()
    if (roleTokens.has(lower)) return false
    return skill.length >= 2
  })

  return filtered.slice(0, 4)
}

function shouldIncludeLocation(
  context: ProfileJobContext,
  filters: JobFilters
): boolean {
  const remoteOnly =
    filters.workModes.length > 0 &&
    filters.workModes.every((mode) => mode === "remote")

  return !remoteOnly && !(context.prefersRemote && filters.workModes.includes("remote"))
}

export function buildJobSearchQuery(
  context: ProfileJobContext,
  filters: JobFilters,
  platforms: JobPlatform[]
): string {
  const parts: string[] = []

  parts.push(quoteTerm(context.role))

  for (const skill of selectCoreSkills(context, filters)) {
    parts.push(quoteTerm(skill))
  }

  const workModeClause = buildWorkModeClause(context, filters)
  if (workModeClause) parts.push(workModeClause)

  const experienceClause = buildExperienceClause(context, filters)
  if (experienceClause) parts.push(experienceClause)

  const jobTypeClause = buildJobTypeClause(filters)
  if (jobTypeClause) parts.push(jobTypeClause)

  const location = filters.location?.trim() || context.location
  if (location && shouldIncludeLocation(context, filters)) {
    parts.push(quoteTerm(location))
  }

  if (context.educationKeyword && /intern|graduate|entry/i.test(context.experienceLevel)) {
    parts.push(quoteTerm(context.educationKeyword))
  }

  parts.push('("jobs" OR "job opening" OR hiring OR vacancy)')

  const siteRestriction = buildSiteRestriction(platforms)
  if (siteRestriction) parts.push(siteRestriction)

  let query = normalizeWhitespace(parts.filter(Boolean).join(" "))

  if (query.length > MAX_QUERY_LENGTH) {
    query = query.slice(0, MAX_QUERY_LENGTH).replace(/\s+\S*$/, "")
  }

  return query
}

export function buildSearchKey(
  context: ProfileJobContext,
  platforms: JobPlatform[],
  filters: JobFilters
): string {
  const payload = JSON.stringify({
    role: context.role,
    location: filters.location?.trim() || context.location || "",
    experienceLevel: filters.experienceLevel?.trim() || context.experienceLevel,
    yearsOfExperience: context.yearsOfExperience,
    prefersRemote: context.prefersRemote,
    platforms: [...platforms].sort(),
    jobTypes: [...filters.jobTypes].sort(),
    workModes: [...filters.workModes].sort(),
    skills: dedupeTerms([
      ...(filters.skills ?? []),
      ...context.topSkills,
      ...context.techStack.slice(0, 4),
    ]).sort(),
  })

  return createHash("sha256").update(payload).digest("hex").slice(0, 24)
}

export function buildJobSearchQueries(
  context: ProfileJobContext,
  filters: JobFilters,
  platforms: JobPlatform[]
): string[] {
  const primary = buildJobSearchQuery(context, filters, platforms)

  if (platforms.length <= 4) {
    return [primary]
  }

  const generalPlatforms = platforms.filter((platform) =>
    ["indeed", "linkedin", "wellfound", "greenhouse", "workable"].includes(platform)
  )
  const nichePlatforms = platforms.filter((platform) =>
    ["upwork", "internshala"].includes(platform)
  )

  const queries = [primary]

  if (nichePlatforms.length > 0 && generalPlatforms.length > 0) {
    queries.push(buildJobSearchQuery(context, filters, nichePlatforms))
  }

  return Array.from(new Set(queries))
}

// Backward-compatible export name used by discover flow
export { buildJobSearchQuery as buildPlatformQuery }
