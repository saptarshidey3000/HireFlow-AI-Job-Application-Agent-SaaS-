import {
  mergePublicationDates,
  parsePublishedDateFromText,
  type ParsedPublicationDate,
} from "@/lib/jobs/published-date"

const FETCH_TIMEOUT_MS = 8000
const MAX_HTML_BYTES = 250_000

function extractJsonLdJobPostingDates(html: string): ParsedPublicationDate[] {
  const results: ParsedPublicationDate[] = []
  const scriptPattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

  for (const match of html.matchAll(scriptPattern)) {
    const raw = match[1]?.trim()
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as unknown
      const nodes = Array.isArray(parsed) ? parsed : [parsed]

      for (const node of nodes) {
        if (!node || typeof node !== "object") continue
        const record = node as Record<string, unknown>
        const type = record["@type"]
        const isJobPosting =
          type === "JobPosting" ||
          (Array.isArray(type) && type.includes("JobPosting"))

        if (!isJobPosting) continue

        const datePosted = record.datePosted
        if (typeof datePosted === "string" && datePosted.trim()) {
          const parsedDate = parsePublishedDateFromText(datePosted)
          if (parsedDate.publishedAt) {
            results.push(parsedDate)
          } else {
            const asDate = new Date(datePosted)
            if (!Number.isNaN(asDate.getTime())) {
              results.push({
                publishedAt: asDate.toISOString(),
                publishedAtText: datePosted,
              })
            }
          }
        }
      }
    } catch {
      continue
    }
  }

  return results
}

function extractMetaPublishedDate(html: string): ParsedPublicationDate {
  const metaPatterns = [
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i,
    /<meta[^>]+property=["']og:updated_time["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i,
  ]

  for (const pattern of metaPatterns) {
    const match = html.match(pattern)
    if (!match?.[1]) continue

    const parsed = parsePublishedDateFromText(match[1])
    if (parsed.publishedAt) return parsed

    const asDate = new Date(match[1])
    if (!Number.isNaN(asDate.getTime())) {
      return { publishedAt: asDate.toISOString(), publishedAtText: match[1] }
    }
  }

  return { publishedAt: null, publishedAtText: null }
}

function extractTimeElementDate(html: string): ParsedPublicationDate {
  const timeMatch = html.match(/<time[^>]+datetime=["']([^"']+)["'][^>]*>([\s\S]*?)<\/time>/i)
  if (!timeMatch?.[1]) {
    return { publishedAt: null, publishedAtText: null }
  }

  const parsed = parsePublishedDateFromText(timeMatch[1])
  if (parsed.publishedAt) {
    return {
      publishedAt: parsed.publishedAt,
      publishedAtText: timeMatch[2]?.replace(/<[^>]+>/g, "").trim() || parsed.publishedAtText,
    }
  }

  const asDate = new Date(timeMatch[1])
  if (!Number.isNaN(asDate.getTime())) {
    return {
      publishedAt: asDate.toISOString(),
      publishedAtText: timeMatch[2]?.replace(/<[^>]+>/g, "").trim() || null,
    }
  }

  return { publishedAt: null, publishedAtText: null }
}

function extractVisiblePostedText(html: string): ParsedPublicationDate {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")

  const patterns = [
    /\bposted\s+\d+\s+(?:minute|hour|day|week)s?\s+ago\b/i,
    /\bposted\s+yesterday\b/i,
    /\bposted\s+on\s+[A-Za-z]{3,9}\s+\d{1,2},?\s+20\d{2}\b/i,
    /\b\d+\s+(?:minute|hour|day|week)s?\s+ago\b/i,
    /\bjust now\b/i,
  ]

  for (const pattern of patterns) {
    const match = stripped.match(pattern)
    if (match?.[0]) {
      return parsePublishedDateFromText(match[0])
    }
  }

  return { publishedAt: null, publishedAtText: null }
}

export function extractPublicationDateFromHtml(html: string): ParsedPublicationDate {
  let result: ParsedPublicationDate = { publishedAt: null, publishedAtText: null }

  for (const jsonLdDate of extractJsonLdJobPostingDates(html)) {
    result = mergePublicationDates(result, jsonLdDate)
  }

  result = mergePublicationDates(result, extractMetaPublishedDate(html))
  result = mergePublicationDates(result, extractTimeElementDate(html))
  result = mergePublicationDates(result, extractVisiblePostedText(html))

  return result
}

export async function fetchJobPagePublicationDate(
  url: string
): Promise<ParsedPublicationDate> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "HireFlowJobBot/1.0 (+https://hireflow.app)",
      },
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
    })

    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
      return { publishedAt: null, publishedAtText: null }
    }

    const reader = response.body?.getReader()
    if (!reader) return { publishedAt: null, publishedAtText: null }

    let html = ""
    let bytes = 0
    const decoder = new TextDecoder()

    while (bytes < MAX_HTML_BYTES) {
      const { done, value } = await reader.read()
      if (done || !value) break
      bytes += value.length
      html += decoder.decode(value, { stream: true })
    }

    reader.cancel().catch(() => undefined)
    return extractPublicationDateFromHtml(html)
  } catch {
    return { publishedAt: null, publishedAtText: null }
  } finally {
    clearTimeout(timeout)
  }
}

const PAGE_FETCH_LIMIT = 12

export async function enrichPublicationDates(
  items: Array<{
    url: string
    title: string
    snippet: string
    publishedAt: string | null
    publishedAtText: string | null
  }>
): Promise<
  Array<{
    url: string
    publishedAt: string | null
    publishedAtText: string | null
  }>
> {
  const now = new Date()

  const withSnippetDates = items.map((item) => {
    const fromSnippet = parsePublishedDateFromText(
      `${item.title} ${item.snippet}`,
      now
    )
    const merged = mergePublicationDates(
      { publishedAt: item.publishedAt, publishedAtText: item.publishedAtText },
      fromSnippet
    )
    return { ...item, ...merged }
  })

  const needsFetch = withSnippetDates
    .filter((item) => !item.publishedAt)
    .slice(0, PAGE_FETCH_LIMIT)

  if (needsFetch.length === 0) {
    return withSnippetDates.map(({ url, publishedAt, publishedAtText }) => ({
      url,
      publishedAt,
      publishedAtText,
    }))
  }

  const fetched = await Promise.all(
    needsFetch.map(async (item) => ({
      url: item.url,
      date: await fetchJobPagePublicationDate(item.url),
    }))
  )

  const fetchedMap = new Map(fetched.map((item) => [item.url, item.date]))

  return withSnippetDates.map((item) => {
    const pageDate = fetchedMap.get(item.url)
    if (!pageDate) {
      return {
        url: item.url,
        publishedAt: item.publishedAt,
        publishedAtText: item.publishedAtText,
      }
    }

    const merged = mergePublicationDates(
      { publishedAt: item.publishedAt, publishedAtText: item.publishedAtText },
      pageDate
    )

    return {
      url: item.url,
      publishedAt: merged.publishedAt,
      publishedAtText: merged.publishedAtText,
    }
  })
}
