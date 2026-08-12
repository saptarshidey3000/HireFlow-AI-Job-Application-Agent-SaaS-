const CRAWLEO_SEARCH_URL = "https://api.crawleo.dev/google-search"
const REQUEST_TIMEOUT_MS = 15000

import type { CrawleoSearchResult, JobSearchResult } from "@/lib/jobs/types"
import {
  resolvePlatformFromUrl,
  resolveSourceFromUrl,
} from "@/lib/jobs/platforms"

interface CrawleoApiResponse {
  parameters?: {
    q?: string
    hl?: string
  }
  google_search_results?: Array<{
    title?: string
    link?: string
    snippet?: string
    position?: number
  }>
  peopleAlsoAsk?: unknown[]
  relatedSearches?: unknown[]
  credits?: number
}

export class JobSearchUnavailableError extends Error {
  code = "JOB_SEARCH_UNAVAILABLE" as const

  constructor(message = "Job search is unavailable.") {
    super(message)
    this.name = "JobSearchUnavailableError"
  }
}

function getApiKey(): string {
  const apiKey = process.env.CRAWLEO_API_KEY?.trim()
  if (!apiKey) {
    throw new JobSearchUnavailableError("CRAWLEO_API_KEY is not configured.")
  }
  return apiKey
}

function validateCrawleoResponse(data: unknown): CrawleoSearchResult[] {
  if (!data || typeof data !== "object") {
    throw new JobSearchUnavailableError("Invalid Crawleo response.")
  }

  const payload = data as CrawleoApiResponse
  const results = payload.google_search_results

  if (!Array.isArray(results)) {
    return []
  }

  return results
    .filter(
      (item): item is Required<Pick<CrawleoSearchResult, "title" | "link">> & {
        snippet?: string
        position?: number
      } =>
        typeof item?.title === "string" &&
        item.title.trim().length > 0 &&
        typeof item?.link === "string" &&
        item.link.trim().length > 0
    )
    .map((item, index) => ({
      title: item.title.trim(),
      link: item.link.trim(),
      snippet: typeof item.snippet === "string" ? item.snippet.trim() : "",
      position:
        typeof item.position === "number" ? item.position : index + 1,
    }))
}

function extractCompany(title: string, snippet: string): string | null {
  const atMatch = title.match(/\bat\s+([A-Za-z0-9&.,'()\- ]{2,80})(?:\s*[-|]|$)/i)
  if (atMatch?.[1]) {
    const company = atMatch[1].trim()
    if (company.length >= 2 && !/jobs?|careers?|hiring/i.test(company)) {
      return company
    }
  }

  const dashParts = title.split(/\s[-–|]\s/)
  if (dashParts.length > 1) {
    const candidate = dashParts[dashParts.length - 1]?.trim()
    if (
      candidate &&
      candidate.length >= 2 &&
      !/jobs?|careers?|search|results/i.test(candidate)
    ) {
      return candidate
    }
  }

  const hiringMatch = snippet.match(
    /\b(?:at|@)\s+([A-Z][A-Za-z0-9&.,'()\- ]{2,60})\b/
  )
  if (hiringMatch?.[1]) {
    return hiringMatch[1].trim()
  }

  return null
}

export function mapCrawleoResults(results: CrawleoSearchResult[]): JobSearchResult[] {
  return results.map((result) => ({
    title: result.title,
    company: extractCompany(result.title, result.snippet),
    url: result.link,
    snippet: result.snippet,
    source: resolveSourceFromUrl(result.link),
    platform: resolvePlatformFromUrl(result.link),
    position: result.position,
  }))
}

export async function searchJobsWithCrawleo(
  query: string,
  options?: { hl?: string; signal?: AbortSignal }
): Promise<JobSearchResult[]> {
  const apiKey = getApiKey()
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const url = new URL(CRAWLEO_SEARCH_URL)
  url.searchParams.set("q", trimmedQuery)
  url.searchParams.set("hl", options?.hl ?? "en")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      signal: options?.signal ?? controller.signal,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new JobSearchUnavailableError("Crawleo request failed.")
    }

    const data = await response.json()
    const rawResults = validateCrawleoResponse(data)
    return mapCrawleoResults(rawResults)
  } catch (error) {
    if (error instanceof JobSearchUnavailableError) {
      throw error
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new JobSearchUnavailableError("Crawleo request timed out.")
    }

    throw new JobSearchUnavailableError("Crawleo request failed.")
  } finally {
    clearTimeout(timeout)
  }
}

export async function searchJobsWithCrawleoMany(
  queries: string[]
): Promise<JobSearchResult[]> {
  const uniqueQueries = Array.from(
    new Set(queries.map((query) => query.trim()).filter(Boolean))
  )

  if (uniqueQueries.length === 0) return []

  const batches = await Promise.all(
    uniqueQueries.map((query) => searchJobsWithCrawleo(query))
  )

  return batches.flat()
}
