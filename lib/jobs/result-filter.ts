import type { JobSearchResult } from "@/lib/jobs/types"

const NON_JOB_PATTERNS = [
  /\b(blog|article|articles|news)\b/i,
  /\bsalary\s+(guide|calculator|insights?|trends?)\b/i,
  /\binterview\s+(questions?|guide|prep|preparation|tips)\b/i,
  /\bcareer\s+(advice|path|guidance|counseling)\b/i,
  /\bhow\s+to\s+(become|get\s+a\s+job|apply|hire|pass)\b/i,
  /\bresume\s+(tips|templates?|builder|examples?|sample)\b/i,
  /\bcover\s+letter\b/i,
  /\btop\s+\d+\s+(companies|skills|courses|certifications)\b/i,
  /\bbest\s+companies\s+to\s+work\b/i,
  /\bcourse\b|\btutorial\b|\bbootcamp\b|\blearn\b/i,
]

const LISTING_SEARCH_PATTERNS = [
  /\b\d+\+?\s+jobs?\s+in\b/i,
  /\b\d+\+?\s+openings?\s+in\b/i,
  /\bfind\s+(all\s+)?jobs?\b/i,
  /\bsearch\s+results\b/i,
  /\ball\s+jobs?\b/i,
  /\bjob\s+listings?\s+page\b/i,
  /\bbrowse\s+jobs?\b/i,
]

const JOB_OPENING_SIGNALS = [
  /\bapply\b/i,
  /\bapply\s+now\b/i,
  /\beasy\s+apply\b/i,
  /\bhiring\b/i,
  /\bjob\s+opening\b/i,
  /\bopening\b/i,
  /\bposition\b/i,
  /\bengineer\b/i,
  /\bdeveloper\b/i,
  /\bdesigner\b/i,
  /\bintern(ship)?\b/i,
  /\bmanager\b/i,
  /\bremote\b/i,
  /\bfull[- ]time\b/i,
  /\bpart[- ]time\b/i,
  /\brole\b/i,
  /\bresponsibilities\b/i,
  /\brequirements\b/i,
  /\bqualifications\b/i,
]

export function isPlatformListingPage(url: string, title: string, snippet: string): boolean {
  const combined = `${title} ${snippet}`.toLowerCase()

  if (LISTING_SEARCH_PATTERNS.some((pattern) => pattern.test(combined))) {
    return true
  }

  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    const search = parsed.search.toLowerCase()

    // Plain root listings like /jobs, /search?q=..., /browse
    if (
      (pathname === "/jobs" || pathname === "/jobs/" || pathname === "/search" || pathname === "/job-search") &&
      (search.includes("q=") || search.includes("query=") || search.includes("l="))
    ) {
      return true
    }
  } catch {
    // If URL cannot be parsed, treat as false
  }

  return false
}

export function isLikelyJobPosting(result: {
  title: string
  snippet: string
  url: string
}): boolean {
  const combined = `${result.title} ${result.snippet} ${result.url}`.toLowerCase()

  // Reject obvious non-job content
  if (NON_JOB_PATTERNS.some((pattern) => pattern.test(combined))) {
    return false
  }

  // Look for positive job opening signals
  const hasSignals = JOB_OPENING_SIGNALS.some((pattern) => pattern.test(combined))
  if (!hasSignals) {
    return false
  }

  return true
}

export function filterJobResults(results: JobSearchResult[]): JobSearchResult[] {
  return results.filter((r) => isLikelyJobPosting(r) && !isPlatformListingPage(r.url, r.title, r.snippet))
}
