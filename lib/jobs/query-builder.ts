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

const INDIAN_CITIES = [
  "bengaluru",
  "bangalore",
  "mumbai",
  "delhi",
  "new delhi",
  "ncr",
  "hyderabad",
  "pune",
  "chennai",
  "kolkata",
  "gurgaon",
  "gurugram",
  "noida",
  "ahmedabad",
  "jaipur",
  "kochi",
  "coimbatore",
  "chandigarh",
  "indore",
]

/**
 * Formats location into search query term.
 * Defaults to "India" if empty.
 * Appends "India" to known Indian cities if not already present.
 */
export function formatLocationClause(location?: string | null): string {
  const trimmed = location?.replace(/\s+/g, " ").trim()
  if (!trimmed) return "India"

  const lower = trimmed.toLowerCase()
  if (lower === "india") return "India"

  if (INDIAN_CITIES.some((city) => lower.includes(city))) {
    if (!lower.includes("india")) {
      return `${trimmed} India`
    }
    return trimmed
  }

  return trimmed
}

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

export interface BuildJobSearchQueryOptions {
  location?: string | null
  remote?: boolean
}

/**
 * Builds the exact verified SerpApi Google Search query for the given target role.
 *
 * Pattern:
 * ("<TARGET_ROLE>") [Location] [(remote OR "work from home" OR "work from anywhere")]
 * (site:wellfound.com OR site:internshala.com OR site:upwork.com OR site:indeed.com OR site:naukri.com OR site:greenhouse.io OR site:lever.co OR site:workable.com)
 * ("Apply" OR "Apply Now" OR "Easy Apply")
 * -blog -article -articles -news -salary -course -interview -resume
 */
export function buildJobSearchQuery(
  targetRole: string,
  options?: BuildJobSearchQueryOptions
): string {
  const sanitizedRole = sanitizeTargetRole(targetRole)
  if (!sanitizedRole) {
    throw new Error("Target role cannot be empty")
  }

  const locationClause = formatLocationClause(options?.location)
  const isRemote = Boolean(options?.remote)
  const remoteClause = isRemote
    ? '(remote OR "work from home" OR "work from anywhere")'
    : ""

  const queryParts = [
    `("${sanitizedRole}")`,
    locationClause,
    remoteClause,
    VERIFIED_PLATFORM_SITES,
    VERIFIED_APPLY_SIGNALS,
    VERIFIED_EXCLUSIONS,
  ].filter(Boolean)

  return queryParts.join(" ")
}

export interface BuildSearchKeyInput {
  targetRole: string
  location?: string | null
  remote?: boolean
  platforms?: (JobPlatform | string)[]
  filters?: JobFilters
  jobTypes?: JobTypeFilter[]
  workModes?: WorkModeFilter[]
  experienceLevel?: string | null
}

/**
 * Builds a deterministic cache key based on search parameters:
 * - targetRole (normalized)
 * - location (normalized, defaults to 'india')
 * - remote (boolean)
 * - selectedPlatforms (sorted, normalized)
 * - jobTypes (sorted)
 * - workModes (sorted)
 * - experienceLevel (normalized)
 */
export function buildSearchKey(input: BuildSearchKeyInput): string {
  const targetRole = sanitizeTargetRole(input.targetRole).toLowerCase()
  const rawLocation = (input.location ?? input.filters?.location ?? "").trim()
  const location = (rawLocation || "india").toLowerCase()

  const isRemote =
    input.remote === true ||
    (input.workModes ?? input.filters?.workModes ?? []).includes("remote")

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
    remote: isRemote,
    platforms,
    jobTypes,
    workModes,
    experienceLevel,
    provider: "serpapi_google_organic_v2",
  })

  return createHash("sha256").update(payload).digest("hex").slice(0, 24)
}
