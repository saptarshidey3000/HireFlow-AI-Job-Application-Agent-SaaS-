import { normalizeJobUrl } from "@/lib/jobs/deduplicate"
import {
  getPlatformConfig,
  resolvePlatformFromUrl,
  resolveSourceFromUrl,
} from "@/lib/jobs/platforms"
import { parsePublishedDateFromText } from "@/lib/jobs/published-date"
import type {
  GoogleJobsApiResult,
  GoogleOrganicApiResult,
} from "@/lib/jobs/serpapi-client"
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
]

const LISTING_TITLE_PATTERNS = [
  /\bsoftware developer jobs\b/i,
  /\bsoftware development jobs\b/i,
  /\bfresher\b.*\bjobs\b/i,
  /\bwork from home jobs\b/i,
  /\b\d+\+?\s*jobs\b/i,
  /\bfind jobs\b/i,
  /\bjob openings in\b/i,
  /\bcareers at\b/i,
]

function detectPlatformFromVia(via: string | undefined): JobPlatform | "unknown" {
  if (!via) return "unknown"
  const lower = via.toLowerCase()

  const map: Array<[RegExp, JobPlatform]> = [
    [/indeed/, "indeed"],
    [/linkedin/, "linkedin"],
    [/wellfound|angel\.?co/, "wellfound"],
    [/internshala/, "internshala"],
    [/upwork/, "upwork"],
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
  via: string | undefined,
  url: string,
  sourceLabel?: string
): { platform: JobPlatform | "unknown"; source: string } {
  const fromVia = detectPlatformFromVia(via)
  const fromUrl = resolvePlatformFromUrl(url)
  const platform =
    fromVia !== "unknown" ? fromVia : fromUrl !== "unknown" ? fromUrl : "unknown"

  if (platform !== "unknown") {
    try {
      return { platform, source: getPlatformConfig(platform).name }
    } catch {
      return { platform, source: resolveSourceFromUrl(url) }
    }
  }

  if (sourceLabel?.trim()) {
    const fromSource = detectPlatformFromVia(sourceLabel)
    if (fromSource !== "unknown") {
      return { platform: fromSource, source: sourceLabel.trim() }
    }
  }

  return { platform: "unknown", source: sourceLabel?.trim() || "Google Jobs" }
}

function pickApplyUrl(job: GoogleJobsApiResult): string {
  const applyOption = job.apply_options?.find((item) => item.link?.trim())
  if (applyOption?.link) return applyOption.link.trim()

  const related = job.related_links?.find((item) => item.link?.trim())
  if (related?.link) return related.link.trim()

  if (job.share_link?.trim()) return job.share_link.trim()

  return ""
}

function inferJobType(text: string, extensions?: string[]): JobType | null {
  const combined = `${text} ${(extensions ?? []).join(" ")}`.toLowerCase()
  if (/\bintern(ship)?\b/.test(combined)) return "internship"
  if (/\bpart[-\s]?time\b/.test(combined)) return "part-time"
  if (/\bcontract\b|\bfreelance\b/.test(combined)) return "contract"
  if (/\bfull[-\s]?time\b/.test(combined)) return "full-time"
  return null
}

function inferWorkMode(
  text: string,
  detected?: GoogleJobsApiResult["detected_extensions"]
): WorkMode | null {
  if (detected?.work_from_home) return "remote"

  const combined = text.toLowerCase()
  if (/\bremote\b|\bwork from home\b|\bwfh\b|\banywhere\b/.test(combined)) {
    return "remote"
  }
  if (/\bhybrid\b/.test(combined)) return "hybrid"
  if (/\bonsite\b|\bon-site\b|\bin office\b|\bon campus\b/.test(combined)) {
    return "onsite"
  }
  return null
}

function extractTags(job: GoogleJobsApiResult): string[] {
  const tags = new Set<string>()

  for (const ext of job.extensions ?? []) {
    if (ext.trim()) tags.add(ext.trim())
  }

  for (const highlight of job.job_highlights ?? []) {
    for (const item of highlight.items ?? []) {
      if (item.trim()) tags.add(item.trim())
    }
  }

  return Array.from(tags).slice(0, 8)
}

function isBlockedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    return BLOCKED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

export function isListingPage(title: string, url: string, snippet: string): boolean {
  const combined = `${title} ${snippet}`.toLowerCase()

  if (LISTING_TITLE_PATTERNS.some((pattern) => pattern.test(combined))) {
    return true
  }

  if (/\bjobs?\s+(in|near|at)\b/i.test(title)) {
    return true
  }

  try {
    const pathname = new URL(url).pathname.toLowerCase()
    if (
      /\/jobs?\/?$/.test(pathname) ||
      /\/search/.test(pathname) ||
      /\/job-category/.test(pathname)
    ) {
      return true
    }
  } catch {
    return false
  }

  return false
}

export function normalizeGoogleJobsResult(
  job: GoogleJobsApiResult
): NormalizedSerpJob | null {
  const title = job.title?.trim()
  const applyUrl = pickApplyUrl(job)
  const url = applyUrl || job.share_link?.trim() || ""

  if (!title || !url || isBlockedDomain(url)) {
    return null
  }

  const snippet = job.description?.trim() || (job.extensions ?? []).join(" · ")
  const listing = isListingPage(title, url, snippet)
  const { platform, source } = resolvePlatform(job.via, applyUrl || url)

  const postedText = job.detected_extensions?.posted_at?.trim() || null
  const publication = postedText
    ? parsePublishedDateFromText(postedText)
    : { publishedAt: null, publishedAtText: null }

  const combined = `${title} ${snippet} ${(job.extensions ?? []).join(" ")}`

  return {
    jobId: job.job_id?.trim() || null,
    title,
    company: job.company_name?.trim() || null,
    location: job.location?.trim() || null,
    source,
    platform,
    url,
    applyUrl: url,
    snippet,
    description: job.description?.trim() || null,
    publishedAt: publication.publishedAt,
    publishedAtText: postedText || publication.publishedAtText,
    companyLogo: job.thumbnail?.trim() || null,
    jobType: inferJobType(combined, job.extensions),
    workMode: inferWorkMode(combined, job.detected_extensions),
    experienceLevel: null,
    salary: job.detected_extensions?.salary?.trim() || null,
    isListingPage: listing,
    tags: extractTags(job),
  }
}

export function normalizeGoogleOrganicResult(
  result: GoogleOrganicApiResult,
  expectedPlatform?: JobPlatform
): NormalizedSerpJob | null {
  const title = result.title?.trim()
  const url = result.link?.trim()
  if (!title || !url || isBlockedDomain(url)) return null

  const snippet = result.snippet?.trim() || ""
  const listing = isListingPage(title, url, snippet)
  const { platform, source } = resolvePlatform(
    result.source,
    url,
    result.source
  )

  const resolvedPlatform = expectedPlatform ?? platform

  return {
    jobId: null,
    title,
    company: null,
    location: null,
    source:
      resolvedPlatform !== "unknown"
        ? getPlatformConfig(resolvedPlatform).name
        : source,
    platform: resolvedPlatform,
    url,
    applyUrl: url,
    snippet,
    description: snippet || null,
    publishedAt: null,
    publishedAtText: listing ? null : "Date unavailable",
    companyLogo: null,
    jobType: inferJobType(`${title} ${snippet}`),
    workMode: inferWorkMode(`${title} ${snippet}`),
    experienceLevel: null,
    salary: null,
    isListingPage: listing,
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
