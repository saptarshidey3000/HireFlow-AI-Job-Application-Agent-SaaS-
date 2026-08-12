import type { JobSearchResult } from "@/lib/jobs/types"

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ref",
  "source",
])

export function normalizeJobUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "")
    parsed.hash = ""

    for (const key of [...parsed.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key)
      }
    }

    let normalized = parsed.toString()
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1)
    }

    return normalized
  } catch {
    return url.trim()
  }
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

export function dedupeJobResults(results: JobSearchResult[]): JobSearchResult[] {
  const byUrl = new Map<string, JobSearchResult>()
  const byTitleSource = new Map<string, JobSearchResult>()

  for (const result of results) {
    const normalizedUrl = normalizeJobUrl(result.url)
    if (byUrl.has(normalizedUrl)) continue

    const titleSourceKey = `${normalizeTitle(result.title)}::${result.source.toLowerCase()}`
    const existing = byTitleSource.get(titleSourceKey)

    if (existing && normalizeJobUrl(existing.url) !== normalizedUrl) {
      const existingPathLength = new URL(existing.url).pathname.length
      const currentPathLength = new URL(result.url).pathname.length
      if (currentPathLength >= existingPathLength) {
        continue
      }
      byUrl.delete(normalizeJobUrl(existing.url))
    }

    byUrl.set(normalizedUrl, { ...result, url: result.url })
    byTitleSource.set(titleSourceKey, result)
  }

  return Array.from(byUrl.values()).sort((a, b) => a.position - b.position)
}
