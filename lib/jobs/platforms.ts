import type { JobPlatform } from "@/lib/jobs/types"

export interface PlatformConfig {
  id: JobPlatform
  name: string
  siteDomain: string
  sitePath?: string
  description: string
}

// This platform set MUST match the verified SerpApi search strategy's
// site: restriction group exactly. Do not add or remove platforms here
// without updating the query in lib/jobs/query-builder.ts to match.
export const JOB_PLATFORMS: PlatformConfig[] = [
  {
    id: "wellfound",
    name: "Wellfound",
    siteDomain: "wellfound.com",
    description: "Startup Jobs",
  },
  {
    id: "internshala",
    name: "Internshala",
    siteDomain: "internshala.com",
    description: "Internships & Jobs",
  },
  {
    id: "upwork",
    name: "Upwork",
    siteDomain: "upwork.com",
    description: "Freelance & Remote",
  },
  {
    id: "indeed",
    name: "Indeed",
    siteDomain: "indeed.com",
    description: "Global Job Board",
  },
  {
    id: "naukri",
    name: "Naukri",
    siteDomain: "naukri.com",
    description: "Top Indian Portal",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    siteDomain: "greenhouse.io",
    description: "Direct Company ATS",
  },
  {
    id: "lever",
    name: "Lever",
    siteDomain: "lever.co",
    description: "Direct Company ATS",
  },
  {
    id: "workable",
    name: "Workable",
    siteDomain: "workable.com",
    description: "Direct Company ATS",
  },
]

export const DEFAULT_PLATFORMS: JobPlatform[] = JOB_PLATFORMS.map(
  (platform) => platform.id
)

export const MULTI_SOURCE_PLATFORMS: JobPlatform[] = DEFAULT_PLATFORMS

const DOMAIN_TO_PLATFORM: Array<{ domain: string; platform: JobPlatform; name: string }> = [
  { domain: "wellfound.com", platform: "wellfound", name: "Wellfound" },
  { domain: "angel.co", platform: "wellfound", name: "Wellfound" },
  { domain: "internshala.com", platform: "internshala", name: "Internshala" },
  { domain: "upwork.com", platform: "upwork", name: "Upwork" },
  { domain: "indeed.com", platform: "indeed", name: "Indeed" },
  { domain: "naukri.com", platform: "naukri", name: "Naukri" },
  { domain: "greenhouse.io", platform: "greenhouse", name: "Greenhouse" },
  { domain: "lever.co", platform: "lever", name: "Lever" },
  { domain: "workable.com", platform: "workable", name: "Workable" },
]

export function getPlatformConfig(id: JobPlatform): PlatformConfig {
  const platform = JOB_PLATFORMS.find((item) => item.id === id)
  if (!platform) throw new Error(`Unknown platform: ${id}`)
  return platform
}

export function resolvePlatformFromUrl(url: string): JobPlatform | "unknown" {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "")
    for (const item of DOMAIN_TO_PLATFORM) {
      if (hostname === item.domain || hostname.endsWith(`.${item.domain}`)) {
        return item.platform
      }
    }
    return "unknown"
  } catch {
    return "unknown"
  }
}

export function resolveSourceFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "")
    for (const item of DOMAIN_TO_PLATFORM) {
      if (hostname === item.domain || hostname.endsWith(`.${item.domain}`)) {
        return item.name
      }
    }
    return "Unknown"
  } catch {
    return "Unknown"
  }
}

export function buildPlatformSiteRestriction(platform: JobPlatform): string {
  const config = getPlatformConfig(platform)
  return `site:${config.siteDomain}`
}