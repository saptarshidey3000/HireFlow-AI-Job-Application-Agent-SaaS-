import type { JobSearchResult } from "@/lib/jobs/types"

const NON_JOB_PATTERNS = [
  /\bsalary\b/i,
  /\binterview questions?\b/i,
  /\binterview guide\b/i,
  /\bcareer advice\b/i,
  /\bhow to get a job\b/i,
  /\bresume tips\b/i,
  /\bcover letter\b/i,
  /\btop \d+ companies\b/i,
  /\bbest companies to work\b/i,
  /\bglassdoor\b/i,
  /\bjob search tips\b/i,
  /\bwhat is a\b/i,
]

const SEARCH_PAGE_PATTERNS = [
  /\/jobs?\/?(?:\?|$)/i,
  /\/search\/?(?:\?|$)/i,
  /\/careers?\/?(?:\?|$)/i,
  /\/job-search\b/i,
  /\/find-jobs\b/i,
  /\/internships?\/?(?:\?|$)/i,
]

const JOB_SIGNAL_PATTERNS = [
  /\bapply\b/i,
  /\bhiring\b/i,
  /\bjob opening\b/i,
  /\bopening\b/i,
  /\bposition\b/i,
  /\bengineer\b/i,
  /\bdeveloper\b/i,
  /\bdesigner\b/i,
  /\bintern\b/i,
  /\bmanager\b/i,
  /\bremote\b/i,
  /\bfull[- ]time\b/i,
  /\bpart[- ]time\b/i,
]

function looksLikeSearchPage(url: string, title: string): boolean {
  const lowerTitle = title.toLowerCase()

  if (/search results|jobs near|find jobs|all jobs|job listings page/i.test(lowerTitle)) {
    return true
  }

  try {
    const pathname = new URL(url).pathname
    return SEARCH_PAGE_PATTERNS.some((pattern) => pattern.test(pathname))
  } catch {
    return false
  }
}

function hasJobSignals(result: JobSearchResult): boolean {
  const combined = `${result.title} ${result.snippet}`
  return JOB_SIGNAL_PATTERNS.some((pattern) => pattern.test(combined))
}

export function isLikelyJobPosting(result: JobSearchResult): boolean {
  const combined = `${result.title} ${result.snippet} ${result.url}`

  if (NON_JOB_PATTERNS.some((pattern) => pattern.test(combined))) {
    return false
  }

  if (looksLikeSearchPage(result.url, result.title)) {
    return false
  }

  return hasJobSignals(result)
}

export function filterJobResults(results: JobSearchResult[]): JobSearchResult[] {
  return results.filter(isLikelyJobPosting)
}
