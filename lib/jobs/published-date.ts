export interface ParsedPublicationDate {
  publishedAt: string | null
  publishedAtText: string | null
}

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

function toIso(date: Date): string {
  return date.toISOString()
}

function extractMatchedPhrase(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern)
  return match?.[0]?.trim() ?? null
}

function parseAbsoluteDate(text: string, now: Date): Date | null {
  const isoMatch = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (isoMatch) {
    const date = new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    )
    return Number.isNaN(date.getTime()) ? null : date
  }

  const longMatch = text.match(
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(20\d{2})\b/i
  )
  if (longMatch) {
    const month = MONTHS[longMatch[1].toLowerCase()]
    const date = new Date(Number(longMatch[3]), month, Number(longMatch[2]))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const shortMatch = text.match(/\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(20\d{2})\b/i)
  if (shortMatch) {
    const month = MONTHS[shortMatch[2].toLowerCase()]
    const date = new Date(Number(shortMatch[3]), month, Number(shortMatch[1]))
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (/\byesterday\b/i.test(text)) {
    const date = new Date(now)
    date.setDate(date.getDate() - 1)
    date.setHours(12, 0, 0, 0)
    return date
  }

  return null
}

function parseRelativeDate(text: string, now: Date): ParsedPublicationDate | null {
  if (/\bjust now\b/i.test(text)) {
    return { publishedAt: toIso(now), publishedAtText: "just now" }
  }

  const minuteMatch = text.match(/\b(\d+)\s+minute[s]?\s+ago\b/i)
  if (minuteMatch) {
    const minutes = Number(minuteMatch[1])
    const date = new Date(now.getTime() - minutes * 60_000)
    return {
      publishedAt: toIso(date),
      publishedAtText: `${minutes} minute${minutes === 1 ? "" : "s"} ago`,
    }
  }

  const hourMatch = text.match(/\b(\d+)\s+hour[s]?\s+ago\b/i)
  if (hourMatch) {
    const hours = Number(hourMatch[1])
    const date = new Date(now.getTime() - hours * 3_600_000)
    return {
      publishedAt: toIso(date),
      publishedAtText: `${hours} hour${hours === 1 ? "" : "s"} ago`,
    }
  }

  const dayMatch = text.match(/\b(\d+)\s+day[s]?\s+ago\b/i)
  if (dayMatch) {
    const days = Number(dayMatch[1])
    const date = new Date(now.getTime() - days * 86_400_000)
    return {
      publishedAt: toIso(date),
      publishedAtText: `${days} day${days === 1 ? "" : "s"} ago`,
    }
  }

  const weekMatch = text.match(/\b(\d+)\s+week[s]?\s+ago\b/i)
  if (weekMatch) {
    const weeks = Number(weekMatch[1])
    const date = new Date(now.getTime() - weeks * 7 * 86_400_000)
    return {
      publishedAt: toIso(date),
      publishedAtText: `${weeks} week${weeks === 1 ? "" : "s"} ago`,
    }
  }

  if (/\byesterday\b/i.test(text)) {
    const date = parseAbsoluteDate("yesterday", now)
    if (date) {
      return { publishedAt: toIso(date), publishedAtText: "yesterday" }
    }
  }

  return null
}

export function parsePublishedDateFromText(
  text: string,
  now: Date = new Date()
): ParsedPublicationDate {
  const trimmed = text.replace(/\s+/g, " ").trim()
  if (!trimmed) {
    return { publishedAt: null, publishedAtText: null }
  }

  const relative = parseRelativeDate(trimmed, now)
  if (relative) return relative

  const absolute = parseAbsoluteDate(trimmed, now)
  if (absolute) {
    const phrase =
      extractMatchedPhrase(trimmed, /\b20\d{2}-\d{2}-\d{2}\b/) ??
      extractMatchedPhrase(
        trimmed,
        /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}\b/i
      ) ??
      extractMatchedPhrase(
        trimmed,
        /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+20\d{2}\b/i
      )

    return {
      publishedAt: toIso(absolute),
      publishedAtText: phrase,
    }
  }

  const postedRelative = trimmed.match(/\bposted\s+(.{3,40}?)(?:[|.]|$)/i)
  if (postedRelative?.[1]) {
    const nested = parsePublishedDateFromText(postedRelative[1], now)
    if (nested.publishedAt) {
      return {
        publishedAt: nested.publishedAt,
        publishedAtText: postedRelative[0].trim(),
      }
    }
  }

  return { publishedAt: null, publishedAtText: null }
}

export function mergePublicationDates(
  primary: ParsedPublicationDate,
  secondary: ParsedPublicationDate
): ParsedPublicationDate {
  if (primary.publishedAt && secondary.publishedAt) {
    const primaryTime = new Date(primary.publishedAt).getTime()
    const secondaryTime = new Date(secondary.publishedAt).getTime()
    if (secondaryTime > primaryTime) {
      return secondary
    }
    return primary
  }

  return primary.publishedAt ? primary : secondary
}

export function formatPublishedAtText(
  publishedAt: string | null,
  publishedAtText: string | null,
  now: Date = new Date()
): string | null {
  if (publishedAtText?.trim()) {
    return publishedAtText.trim()
  }

  if (!publishedAt) return null

  const diffMs = now.getTime() - new Date(publishedAt).getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60_000))
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`
  }

  const diffHours = Math.round(diffMs / 3_600_000)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  }

  const diffDays = Math.round(diffMs / 86_400_000)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  }

  return new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
