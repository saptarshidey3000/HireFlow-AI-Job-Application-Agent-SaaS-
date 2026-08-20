import { normalizeJobUrl } from "@/lib/jobs/deduplicate"
import {
  getPlatformConfig,
  resolvePlatformFromUrl,
  resolveSourceFromUrl,
} from "@/lib/jobs/platforms"
import { parsePublishedDateFromText } from "@/lib/jobs/published-date"
import { isLikelyJobPosting, isPlatformListingPage } from "@/lib/jobs/result-filter"
import type { GoogleOrganicApiResult } from "@/lib/jobs/serpapi-client"
import type { JobPlatform, JobType, WorkMode } from "@/lib/jobs/types"

export interface NormalizedSerpJob {
  jobId: string | null
  title: string
  company: string | null
  location: string | null
  source: string
  platform: JobPlatform | "unknown"
  url: string
  applyUrl: string
  snippet: string
  description: string | null
  position: number
  displayedLink: string | null
  publishedAt: string | null
  publishedAtText: string | null
  companyLogo: string | null
  jobType: JobType | null
  workMode: WorkMode | null
  experienceLevel: string | null
  salary: string | null
  isListingPage: boolean
  tags: string[]
}

const BLOCKED_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "youtube.com",
  "reddit.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "pinterest.com",
  "medium.com",
  "quora.com",
]

function detectPlatformFromLabel(label: string | undefined): JobPlatform | "unknown" {
  if (!label) return "unknown"
  const lower = label.toLowerCase()

  const map: Array<[RegExp, JobPlatform]> = [
    [/wellfound|angel\.?co/, "wellfound"],
    [/internshala/, "internshala"],
    [/upwork/, "upwork"],
    [/indeed/, "indeed"],
    [/naukri/, "naukri"],
    [/greenhouse/, "greenhouse"],
    [/lever/, "lever"],
    [/workable/, "workable"],
  ]

  for (const [pattern, platform] of map) {
    if (pattern.test(lower)) return platform
  }

  return "unknown"
}

function resolvePlatform(
  url: string,
  sourceLabel?: string
): { platform: JobPlatform | "unknown"; source: string } {
  const fromUrl = resolvePlatformFromUrl(url)
  const platform =
    fromUrl !== "unknown" ? fromUrl : detectPlatformFromLabel(sourceLabel)

  if (platform !== "unknown") {
    try {
      return { platform, source: getPlatformConfig(platform).name }
    } catch {
      return { platform, source: resolveSourceFromUrl(url) }
    }
  }

  return { platform: "unknown", source: "Unknown" }
}

function inferJobType(text: string): JobType | null {
  const combined = text.toLowerCase()
  if (/\bintern(ship)?\b/.test(combined)) return "internship"
  if (/\bpart[-\s]?time\b/.test(combined)) return "part-time"
  if (/\bcontract\b|\bfreelance\b/.test(combined)) return "contract"
  if (/\bfull[-\s]?time\b/.test(combined)) return "full-time"
  return null
}

function inferWorkMode(text: string): WorkMode | null {
  const combined = text.toLowerCase()

  // Check hybrid first
  if (/\bhybrid\b/.test(combined)) {
    return "hybrid"
  }

  // Strong remote signals
  if (
    /\b(fully\s+remote|100%\s+remote|remote\s*[-–,]\s*india|remote\s+in\s+india|work\s+from\s+home|wfh|work\s+from\s+anywhere|remote\s+anywhere|remotely|remote\s+work|remote\s+option|anywhere\s+in\s+india|remote)\b/i.test(
      combined
    )
  ) {
    return "remote"
  }

  if (/\b(on[-\s]?site|in[-\s]?office|office[-\s]?based|on[-\s]?campus)\b/i.test(combined)) {
    return "onsite"
  }

  return null
}

function extractLocationFromText(text: string, defaultLocation = "India"): string {
  const combined = text.toLowerCase()

  const cities = [
    { name: "Bengaluru, India", regex: /\b(bengaluru|bangalore)\b/i },
    { name: "Mumbai, India", regex: /\bmumbai\b/i },
    { name: "Delhi NCR, India", regex: /\b(delhi|new delhi|noida|gurgaon|gurugram|ncr)\b/i },
    { name: "Hyderabad, India", regex: /\bhyderabad\b/i },
    { name: "Pune, India", regex: /\bpune\b/i },
    { name: "Chennai, India", regex: /\bchennai\b/i },
    { name: "Kolkata, India", regex: /\bkolkata\b/i },
    { name: "Ahmedabad, India", regex: /\bahmedabad\b/i },
    { name: "Kochi, India", regex: /\bkochi\b/i },
    { name: "Jaipur, India", regex: /\bjaipur\b/i },
    { name: "Chandigarh, India", regex: /\bchandigarh\b/i },
    { name: "Indore, India", regex: /\bindore\b/i },
    { name: "India", regex: /\bindia\b/i },
    { name: "United States", regex: /\b(united states|usa|san francisco|new york|austin|seattle)\b/i },
    { name: "United Kingdom", regex: /\b(united kingdom|london|uk)\b/i },
    { name: "Canada", regex: /\b(canada|toronto|vancouver)\b/i },
    { name: "Germany", regex: /\b(germany|berlin|munich)\b/i },
    { name: "Singapore", regex: /\bsingapore\b/i },
  ]

  for (const item of cities) {
    if (item.regex.test(combined)) {
      return item.name
    }
  }

  return defaultLocation
}

function isBlockedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "")
    return BLOCKED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

function extractCompanyFromTitle(title: string, source: string): string | null {
  // Common patterns: "Role - Company", "Role at Company", "Company hiring Role"
  const atMatch = title.match(/\bat\s+([A-Za-z0-9\s.,&'-]+?)(?:\s*[-–|:]|$)/i)
  if (atMatch?.[1]) {
    const company = atMatch[1].trim()
    if (company.length > 1 && company.length < 50) return company
  }

  const dashParts = title.split(/\s[-–|]\s/)
  if (dashParts.length >= 2) {
    const candidate = dashParts[dashParts.length - 1].trim()
    if (
      candidate &&
      !candidate.toLowerCase().includes(source.toLowerCase()) &&
      candidate.length < 40
    ) {
      return candidate
    }
  }

  return null
}

/**
 * Normalizes a single organic_results entry from Google search.
 */
export function normalizeGoogleOrganicResult(
  result: GoogleOrganicApiResult
): NormalizedSerpJob | null {
  const title = result.title?.trim()
  const url = result.link?.trim()
  if (!title || !url || isBlockedDomain(url)) return null

  const snippet = result.snippet?.trim() || ""

  // Lightweight validation layer
  if (!isLikelyJobPosting({ title, snippet, url })) {
    return null
  }

  const isListing = isPlatformListingPage(url, title, snippet)
  const { platform, source } = resolvePlatform(url, result.source)

  const combined = `${title} ${snippet}`
  const publication = parsePublishedDateFromText(snippet)
  const company = extractCompanyFromTitle(title, source)
  const workMode = inferWorkMode(combined)
  const location = extractLocationFromText(combined, "India")

  return {
    jobId: null,
    title,
    company,
    location,
    source,
    platform,
    url,
    applyUrl: url,
    snippet,
    description: snippet || null,
    position: result.position ?? 0,
    displayedLink: result.displayed_link ?? null,
    publishedAt: publication.publishedAt,
    publishedAtText: publication.publishedAtText,
    companyLogo: null,
    jobType: inferJobType(combined),
    workMode,
    experienceLevel: null,
    salary: null,
    isListingPage: isListing,
    tags: [],
  }
}

export function dedupeSerpJobs(jobs: NormalizedSerpJob[]): NormalizedSerpJob[] {
  const seen = new Map<string, NormalizedSerpJob>()

  function makeKeys(job: NormalizedSerpJob): string[] {
    const keys: string[] = []
    if (job.jobId) keys.push(`id:${job.jobId}`)
    keys.push(`url:${normalizeJobUrl(job.applyUrl || job.url)}`)
    keys.push(
      `title:${job.title.toLowerCase()}::${(job.company ?? "").toLowerCase()}::${(job.location ?? "").toLowerCase()}`
    )
    return keys
  }

  for (const job of jobs) {
    const keys = makeKeys(job)
    let existingKey: string | null = null

    for (const key of keys) {
      if (seen.has(key)) {
        existingKey = key
        break
      }
    }

    if (existingKey) {
      const existing = seen.get(existingKey)!
      const preferred =
        existing.publishedAt && !job.publishedAt
          ? existing
          : job.publishedAt && !existing.publishedAt
            ? job
            : (job.description?.length ?? 0) > (existing.description?.length ?? 0)
              ? job
              : existing

      for (const key of makeKeys(preferred)) {
        seen.set(key, preferred)
      }
      continue
    }

    for (const key of keys) {
      seen.set(key, job)
    }
  }

  const unique = new Set<NormalizedSerpJob>()
  for (const job of seen.values()) {
    unique.add(job)
  }

  return Array.from(unique).filter((job) => !job.isListingPage)
}