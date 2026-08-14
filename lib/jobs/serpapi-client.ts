const SERPAPI_URL = "https://serpapi.com/search"
const REQUEST_TIMEOUT_MS = 20000

export type SerpApiErrorCode =
  | "SEARCH_PROVIDER_ERROR"
  | "INVALID_REQUEST"
  | "RATE_LIMITED"
  | "NO_RESULTS"

export class SerpApiSearchError extends Error {
  code: SerpApiErrorCode
  statusCode?: number

  constructor(code: SerpApiErrorCode, message: string, statusCode?: number) {
    super(message)
    this.name = "SerpApiSearchError"
    this.code = code
    this.statusCode = statusCode
  }
}

export interface SerpApiPagination {
  next_page_token?: string
  next?: string
}

export interface GoogleOrganicApiResult {
  position?: number
  title?: string
  link?: string
  displayed_link?: string
  snippet?: string
  source?: string
}

export interface SerpApiGoogleResponse {
  organic_results?: GoogleOrganicApiResult[]
  serpapi_pagination?: SerpApiPagination
  search_metadata?: { status?: string; id?: string }
  error?: string
}

function getApiKey(): string {
  const apiKey = process.env.SERPAPI_API_KEY?.trim()
  if (!apiKey) {
    throw new SerpApiSearchError(
      "SEARCH_PROVIDER_ERROR",
      "SERPAPI_API_KEY is not configured."
    )
  }
  return apiKey
}

function classifySerpApiError(message: string): SerpApiErrorCode {
  if (/rate limit/i.test(message)) return "RATE_LIMITED"
  if (/invalid.*api key|unauthorized|account/i.test(message)) return "INVALID_REQUEST"
  if (
    /hasn't returned any results|no results found|did not match any documents/i.test(
      message
    )
  ) {
    return "NO_RESULTS"
  }
  return "SEARCH_PROVIDER_ERROR"
}

function isNoResultsMessage(message: string): boolean {
  return classifySerpApiError(message) === "NO_RESULTS"
}

function emptySerpApiPayload<T>(data: T & { error?: string }): T {
  const payload = data as T & {
    organic_results?: GoogleOrganicApiResult[]
    error?: string
  }

  return {
    ...payload,
    organic_results: payload.organic_results ?? [],
    error: undefined,
  } as T
}

function mapHttpError(status: number): SerpApiSearchError {
  if (status === 401 || status === 403) {
    return new SerpApiSearchError(
      "INVALID_REQUEST",
      "Invalid SerpApi credentials.",
      status
    )
  }
  if (status === 429) {
    return new SerpApiSearchError(
      "RATE_LIMITED",
      "SerpApi rate limit reached.",
      status
    )
  }
  return new SerpApiSearchError(
    "SEARCH_PROVIDER_ERROR",
    "SerpApi request failed.",
    status
  )
}

async function serpApiGet<T>(
  params: Record<string, string | undefined>,
  signal?: AbortSignal
): Promise<T> {
  const apiKey = getApiKey()
  const url = new URL(SERPAPI_URL)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value)
    }
  }
  url.searchParams.set("api_key", apiKey)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: signal ?? controller.signal,
      cache: "no-store",
    })

    if (!response.ok) {
      throw mapHttpError(response.status)
    }

    const data = (await response.json()) as T & { error?: string }

    if (typeof data.error === "string" && data.error.trim()) {
      if (isNoResultsMessage(data.error)) {
        return emptySerpApiPayload(data)
      }

      const code = classifySerpApiError(data.error)
      throw new SerpApiSearchError(code, data.error)
    }

    return data
  } catch (error) {
    if (error instanceof SerpApiSearchError) throw error
    if (error instanceof Error && error.name === "AbortError") {
      throw new SerpApiSearchError(
        "SEARCH_PROVIDER_ERROR",
        "SerpApi request timed out."
      )
    }
    throw new SerpApiSearchError(
      "SEARCH_PROVIDER_ERROR",
      "SerpApi request failed."
    )
  } finally {
    clearTimeout(timeout)
  }
}

export interface GoogleOrganicSearchParams {
  q: string
  location?: string
  gl?: string
  google_domain?: string
  hl?: string
  start?: number
  noCache?: boolean
  signal?: AbortSignal
}

/**
 * Runs the verified SerpApi search strategy: engine=google against
 * organic_results with English default hl=en.
 */
export async function searchGoogleOrganic(
  params: GoogleOrganicSearchParams
): Promise<SerpApiGoogleResponse> {
  return serpApiGet<SerpApiGoogleResponse>(
    {
      engine: "google",
      q: params.q,
      location: params.location || "India",
      gl: params.gl || "in",
      google_domain: params.google_domain || "google.co.in",
      hl: params.hl || "en",
      num: "10",
      start: params.start ? String(params.start) : undefined,
      no_cache: params.noCache ? "true" : undefined,
    },
    params.signal
  )
}