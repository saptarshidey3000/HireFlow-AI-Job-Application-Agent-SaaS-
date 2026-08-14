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

function normalizeCompany(company: string | null): string {
  return (company ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function titleSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalizeTitle(a).split(" ").filter(Boolean))
  const tokensB = new Set(normalizeTitle(b).split(" ").filter(Boolean))
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let overlap = 0
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap += 1
  }

  return overlap / Math.max(tokensA.size, tokensB.size)
}

function isObviousDuplicate(a: JobSearchResult, b: JobSearchResult): boolean {
  const companyA = normalizeCompany(a.company)
  const companyB = normalizeCompany(b.company)

  if (companyA && companyB && companyA === companyB) {
    return titleSimilarity(a.title, b.title) >= 0.82
  }

  return titleSimilarity(a.title, b.title) >= 0.92
}

function pickPreferredResult(
  current: JobSearchResult,
  candidate: JobSearchResult
): JobSearchResult {
  if (candidate.publishedAt && !current.publishedAt) return candidate
  if (current.publishedAt && !candidate.publishedAt) return current

  if (candidate.publishedAt && current.publishedAt) {
    const candidateTime = new Date(candidate.publishedAt).getTime()
    const currentTime = new Date(current.publishedAt).getTime()
    if (candidateTime > currentTime) return candidate
  }

  if (candidate.snippet.length > current.snippet.length) return candidate
  return current
}

export function dedupeJobResults(results: JobSearchResult[]): JobSearchResult[] {
  const byUrl = new Map<string, JobSearchResult>()
  const canonical: JobSearchResult[] = []

  for (const result of results) {
    const normalizedUrl = normalizeJobUrl(result.url)
    const existingByUrl = byUrl.get(normalizedUrl)
    if (existingByUrl) {
      byUrl.set(normalizedUrl, pickPreferredResult(existingByUrl, result))
      continue
    }

    let merged = false
    for (let index = 0; index < canonical.length; index += 1) {
      const existing = canonical[index]
      const sameSource =
        existing.source.toLowerCase() === result.source.toLowerCase()
      const duplicate =
        (sameSource &&
          normalizeTitle(existing.title) === normalizeTitle(result.title)) ||
        isObviousDuplicate(existing, result)

      if (!duplicate) continue

      const preferred = pickPreferredResult(existing, result)
      canonical[index] = preferred
      byUrl.delete(normalizeJobUrl(existing.url))
      byUrl.set(normalizeJobUrl(preferred.url), preferred)
      merged = true
      break
    }

    if (merged) continue

    byUrl.set(normalizedUrl, result)
    canonical.push(result)
  }

  return canonical
}
