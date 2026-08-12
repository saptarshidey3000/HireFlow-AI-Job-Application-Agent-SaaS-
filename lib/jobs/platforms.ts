import type { JobPlatform } from "@/lib/jobs/types"

export interface PlatformConfig {
  id: JobPlatform
  name: string
  siteDomain: string
  description: string
}

export const JOB_PLATFORMS: PlatformConfig[] = [
  {
    id: "greenhouse",
    name: "Greenhouse",
    siteDomain: "greenhouse.io",
    description: "Jobs",
  },
  {
    id: "upwork",
    name: "Upwork",
    siteDomain: "upwork.com",
    description: "Jobs",
  },
  {
    id: "workable",
    name: "Workable",
    siteDomain: "workable.com",
    description: "Jobs",
  },
  {
    id: "wellfound",
    name: "Wellfound",
    siteDomain: "wellfound.com",
    description: "Jobs",
  },
  {
    id: "internshala",
    name: "Internshala",
    siteDomain: "internshala.com",
    description: "Jobs",
  },
  {
    id: "indeed",
    name: "Indeed",
    siteDomain: "indeed.com",
    description: "Jobs",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    siteDomain: "linkedin.com",
    description: "Jobs",
  },
]

export const DEFAULT_PLATFORMS: JobPlatform[] = [
  "greenhouse",
  "wellfound",
  "internshala",
]

const HOSTNAME_TO_PLATFORM: Record<string, JobPlatform> = {
  "greenhouse.io": "greenhouse",
  "boards.greenhouse.io": "greenhouse",
  "upwork.com": "upwork",
  "workable.com": "workable",
  "wellfound.com": "wellfound",
  "internshala.com": "internshala",
  "indeed.com": "indeed",
  "www.indeed.com": "indeed",
  "linkedin.com": "linkedin",
  "www.linkedin.com": "linkedin",
}

const HOSTNAME_TO_SOURCE: Record<string, string> = {
  "greenhouse.io": "Greenhouse",
  "boards.greenhouse.io": "Greenhouse",
  "upwork.com": "Upwork",
  "workable.com": "Workable",
  "wellfound.com": "Wellfound",
  "internshala.com": "Internshala",
  "indeed.com": "Indeed",
  "www.indeed.com": "Indeed",
  "linkedin.com": "LinkedIn",
  "www.linkedin.com": "LinkedIn",
}

export function getPlatformConfig(id: JobPlatform): PlatformConfig {
  const platform = JOB_PLATFORMS.find((item) => item.id === id)
  if (!platform) throw new Error(`Unknown platform: ${id}`)
  return platform
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

export function buildSiteRestriction(platforms: JobPlatform[]): string | null {
  if (platforms.length === 0) return null

  const domains = platforms.map((platform) => getPlatformConfig(platform).siteDomain)
  const unique = Array.from(new Set(domains))

  if (unique.length === 1) {
    return `site:${unique[0]}`
  }

  return `(${unique.map((domain) => `site:${domain}`).join(" OR ")})`
}
