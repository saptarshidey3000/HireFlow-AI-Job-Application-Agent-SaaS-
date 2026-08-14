import type { JobPlatform } from "@/lib/jobs/types"

export interface PlatformConfig {
  id: JobPlatform
  name: string
  siteDomain: string
  sitePath?: string
  description: string
}

export const JOB_PLATFORMS: PlatformConfig[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    siteDomain: "linkedin.com",
    sitePath: "/jobs",
    description: "Jobs",
  },
  {
    id: "indeed",
    name: "Indeed",
    siteDomain: "indeed.com",
    description: "Jobs",
  },
  {
    id: "wellfound",
    name: "Wellfound",
    siteDomain: "wellfound.com",
    description: "Jobs",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    siteDomain: "greenhouse.io",
    description: "Jobs",
  },
  {
    id: "lever",
    name: "Lever",
    siteDomain: "lever.co",
    description: "Jobs",
  },
  {
    id: "workable",
    name: "Workable",
    siteDomain: "workable.com",
    description: "Jobs",
  },
  {
    id: "internshala",
    name: "Internshala",
    siteDomain: "internshala.com",
    description: "Jobs",
  },
  {
    id: "upwork",
    name: "Upwork",
    siteDomain: "upwork.com",
    description: "Jobs",
  },
]

export const DEFAULT_PLATFORMS: JobPlatform[] = [
  "linkedin",
  "indeed",
  "wellfound",
  "greenhouse",
  "lever",
  "workable",
  "internshala",
]

export const MULTI_SOURCE_PLATFORMS: JobPlatform[] = DEFAULT_PLATFORMS

const HOSTNAME_TO_PLATFORM: Record<string, JobPlatform> = {
  "greenhouse.io": "greenhouse",
  "boards.greenhouse.io": "greenhouse",
  "job-boards.greenhouse.io": "greenhouse",
  "lever.co": "lever",
  "jobs.lever.co": "lever",
  "upwork.com": "upwork",
  "workable.com": "workable",
  "apply.workable.com": "workable",
  "wellfound.com": "wellfound",
  "angel.co": "wellfound",
  "internshala.com": "internshala",
  "indeed.com": "indeed",
  "www.indeed.com": "indeed",
  "in.indeed.com": "indeed",
  "linkedin.com": "linkedin",
  "www.linkedin.com": "linkedin",
}

const HOSTNAME_TO_SOURCE: Record<string, string> = {
  "greenhouse.io": "Greenhouse",
  "boards.greenhouse.io": "Greenhouse",
  "job-boards.greenhouse.io": "Greenhouse",
  "lever.co": "Lever",
  "jobs.lever.co": "Lever",
  "upwork.com": "Upwork",
  "workable.com": "Workable",
  "apply.workable.com": "Workable",
  "wellfound.com": "Wellfound",
  "angel.co": "Wellfound",
  "internshala.com": "Internshala",
  "indeed.com": "Indeed",
  "www.indeed.com": "Indeed",
  "in.indeed.com": "Indeed",
  "linkedin.com": "LinkedIn",
  "www.linkedin.com": "LinkedIn",
}

export function getPlatformConfig(id: JobPlatform): PlatformConfig {
  const platform = JOB_PLATFORMS.find((item) => item.id === id)
  if (!platform) throw new Error(`Unknown platform: ${id}`)
  return platform
}

export function buildPlatformSiteRestriction(platform: JobPlatform): string {
  const config = getPlatformConfig(platform)
  if (config.sitePath) {
    return `site:${config.siteDomain}${config.sitePath}`
  }
  return `site:${config.siteDomain}`
}

export function resolvePlatformFromUrl(url: string): JobPlatform | "unknown" {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    return HOSTNAME_TO_PLATFORM[hostname] ?? HOSTNAME_TO_PLATFORM[`www.${hostname}`] ?? "unknown"
  } catch {
    return "unknown"
  }
}

export function resolveSourceFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    return (
      HOSTNAME_TO_SOURCE[hostname] ??
      HOSTNAME_TO_SOURCE[`www.${hostname}`] ??
      hostname
    )
  } catch {
    return "Unknown"
  }
}

/** @deprecated Prefer per-source queries via buildPlatformSiteRestriction */
export function buildSiteRestriction(platforms: JobPlatform[]): string | null {
  if (platforms.length === 0) return null

  const domains = platforms.map((platform) => buildPlatformSiteRestriction(platform))
  const unique = Array.from(new Set(domains))

  if (unique.length === 1) {
    return unique[0]
  }

  return `(${unique.join(" OR ")})`
}
