import { createHash } from "crypto"

import type {
  JobFilters,
  JobPlatform,
  JobTypeFilter,
  WorkModeFilter,
} from "@/lib/jobs/types"

const VERIFIED_PLATFORM_SITES =
  "(site:wellfound.com OR site:internshala.com OR site:upwork.com OR site:indeed.com OR site:naukri.com OR site:greenhouse.io OR site:lever.co OR site:workable.com)"

const VERIFIED_APPLY_SIGNALS = '("Apply" OR "Apply Now" OR "Easy Apply")'

const VERIFIED_EXCLUSIONS =
  "-blog -article -articles -news -salary -course -interview -resume"

/**
 * Normalizes and sanitizes the user's target role:
 * - trims whitespace
 * - collapses repeated whitespace
 * - removes accidental surrounding single or double quotes
 * - preserves multi-word roles
 * - safely escapes any internal quotes or special characters
 */
export function sanitizeTargetRole(value: string | null | undefined): string {
  if (!value || typeof value !== "string") return ""

  let role = value.replace(/\s+/g, " ").trim()

  // Strip accidental outer double or single quotes
  while (
    (role.startsWith('"') && role.endsWith('"')) ||
    (role.startsWith("'") && role.endsWith("'"))
  ) {
    role = role.slice(1, -1).trim()
  }

  // Remove unsafe punctuation/tags while keeping alphanumeric, spaces, +, #, ., -, /
  role = role.replace(/[<>[\]{}"]/g, "").replace(/\s+/g, " ").trim()

  return role.slice(0, 100)
}

/**
 * Builds the exact verified SerpApi Google Search query for the given target role.
 *
 * Pattern:
 * ("<TARGET_ROLE>")
 * (site:wellfound.com OR site:internshala.com OR site:upwork.com OR site:indeed.com OR site:naukri.com OR site:greenhouse.io OR site:lever.co OR site:workable.com)
 * ("Apply" OR "Apply Now" OR "Easy Apply")
 * -blog -article -articles -news -salary -course -interview -resume
 */
export function buildJobSearchQuery(targetRole: string): string {
  const sanitizedRole = sanitizeTargetRole(targetRole)
  if (!sanitizedRole) {
    throw new Error("Target role cannot be empty")
  }

  return `("${sanitizedRole}") ${VERIFIED_PLATFORM_SITES} ${VERIFIED_APPLY_SIGNALS} ${VERIFIED_EXCLUSIONS}`
}

export interface BuildSearchKeyInput {
  targetRole: string
  location?: string | null
  platforms?: (JobPlatform | string)[]
  filters?: JobFilters
  jobTypes?: JobTypeFilter[]
  workModes?: WorkModeFilter[]
  experienceLevel?: string | null
}

/**
 * Builds a deterministic cache key based on search parameters:
 * - targetRole (normalized)
 * - location (normalized)
 * - selectedPlatforms (sorted, normalized)
 * - jobTypes (sorted)
 * - workModes / remotePreference (sorted)
 * - experienceLevel (normalized)
 */
export function buildSearchKey(input: BuildSearchKeyInput): string {
  const targetRole = sanitizeTargetRole(input.targetRole).toLowerCase()
  const location = (input.location ?? input.filters?.location ?? "").trim().toLowerCase()
  
  const platforms = Array.from(
    new Set((input.platforms ?? []).map((p) => String(p).toLowerCase().trim()).filter(Boolean))
  ).sort()

  const jobTypes = Array.from(
    new Set((input.jobTypes ?? input.filters?.jobTypes ?? []).map((t) => String(t).toLowerCase().trim()).filter(Boolean))
  ).sort()

  const workModes = Array.from(
    new Set((input.workModes ?? input.filters?.workModes ?? []).map((w) => String(w).toLowerCase().trim()).filter(Boolean))
  ).sort()

  const experienceLevel = (input.experienceLevel ?? input.filters?.experienceLevel ?? "").trim().toLowerCase()

  const payload = JSON.stringify({
    targetRole,
    location,
    platforms,
    jobTypes,
    workModes,
    experienceLevel,
    provider: "serpapi_google_organic",
  })

  return createHash("sha256").update(payload).digest("hex").slice(0, 24)
}
