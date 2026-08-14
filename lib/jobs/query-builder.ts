import { createHash } from "crypto"

import { buildPlatformSiteRestriction } from "@/lib/jobs/platforms"
import type {
  JobFilters,
  JobPlatform,
  ProfileJobContext,
} from "@/lib/jobs/types"

const MAX_QUERY_LENGTH = 200

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

function selectRelevantSkills(
  context: ProfileJobContext,
  filters: JobFilters,
  targetRole: string,
  max = 8
): string[] {
  const roleTokens = new Set(
    targetRole.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean)
  )

  const candidates = dedupeTerms([
    ...(filters.skills ?? []),
    ...context.topSkills,
    ...context.techStack,
    ...context.skills,
  ])

  return candidates
    .filter((skill) => {
      const lower = skill.toLowerCase()
      return skill.length >= 2 && !roleTokens.has(lower)
    })
    .slice(0, max)
}

export interface BuildJobSearchQueryInput {
  targetRole: string
  context: ProfileJobContext
  filters: JobFilters
}

export function buildJobSearchQuery(input: BuildJobSearchQueryInput): string {
  const { targetRole, context, filters } = input
  const parts: string[] = [normalizeWhitespace(targetRole)]

  for (const skill of selectRelevantSkills(context, filters, targetRole)) {
    parts.push(skill)
  }

  if (filters.jobTypes.includes("internship")) {
    parts.push("internship")
  } else if (filters.jobTypes.includes("contract")) {
    parts.push("contract")
  } else if (filters.jobTypes.includes("part-time")) {
    parts.push("part-time")
  }

  const level = filters.experienceLevel?.trim() || context.experienceLevel
  if (/entry|junior|graduate|fresher|0-1|1 year/i.test(level)) {
    parts.push("entry level")
  } else if (/senior|lead|principal/i.test(level)) {
    parts.push("senior")
  }

  if (filters.workModes.includes("remote") || context.prefersRemote) {
    parts.push("remote")
  }

  let query = dedupeTerms(parts).join(" ")

  if (query.length > MAX_QUERY_LENGTH) {
    query = query.slice(0, MAX_QUERY_LENGTH).replace(/\s+\S*$/, "")
  }

  return query
}

export function buildPlatformFallbackQuery(
  platform: JobPlatform,
  targetRole: string,
  location?: string | null
): string {
  const parts = [buildPlatformSiteRestriction(platform), quoteTerm(targetRole)]

  if (location?.trim()) {
    parts.push(quoteTerm(location.trim()))
  }

  return normalizeWhitespace(parts.filter(Boolean).join(" "))
}

export function buildSearchKey(
  targetRole: string,
  context: ProfileJobContext,
  platforms: JobPlatform[],
  filters: JobFilters
): string {
  const payload = JSON.stringify({
    targetRole: targetRole.trim().toLowerCase(),
    location: filters.location?.trim() || context.location || "",
    experienceLevel: filters.experienceLevel?.trim() || context.experienceLevel,
    prefersRemote: context.prefersRemote,
    platforms: [...platforms].sort(),
    jobTypes: [...filters.jobTypes].sort(),
    workModes: [...filters.workModes].sort(),
    skills: selectRelevantSkills(context, filters, targetRole, 10).sort(),
    provider: "serpapi",
  })

  return createHash("sha256").update(payload).digest("hex").slice(0, 24)
}

export function buildPlatformFallbackQueries(
  platforms: JobPlatform[],
  targetRole: string,
  location?: string | null
): Array<{ platform: JobPlatform; query: string }> {
  return platforms.map((platform) => ({
    platform,
    query: buildPlatformFallbackQuery(platform, targetRole, location),
  }))
}
