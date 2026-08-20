export type JobSortMode = "latest" | "best_match" | "latest_best_match"

// Keep in sync with the verified SerpApi search strategy's site: group in
// lib/jobs/query-builder.ts and the entries in lib/jobs/platforms.ts.
export type JobPlatform =
  | "wellfound"
  | "internshala"
  | "upwork"
  | "indeed"
  | "naukri"
  | "greenhouse"
  | "lever"
  | "workable"

export type JobType =
  | "full-time"
  | "part-time"
  | "internship"
  | "contract"
  | "unknown"

export type WorkMode =
  | "remote"
  | "hybrid"
  | "on-campus"
  | "onsite"
  | "unknown"

export type JobTypeFilter = "full-time" | "part-time" | "internship" | "contract"
export type WorkModeFilter = "remote" | "hybrid" | "on-campus"

export type JobSearchErrorCode =
  | "SEARCH_PROVIDER_ERROR"
  | "INVALID_REQUEST"
  | "RATE_LIMITED"
  | "NO_RESULTS"
  | "UNAUTHORIZED"
  | "PROFILE_REQUIRED"
  | "TARGET_ROLE_REQUIRED"

export interface JobFilters {
  jobTypes: JobTypeFilter[]
  workModes: WorkModeFilter[]
  location?: string
  experienceLevel?: string
  salaryMin?: string
  skills?: string[]
  postedWithin?: string
}

export interface JobMatchDetails {
  matchedSkills: string[]
  missingSkills: string[]
  matchedTechnologies: string[]
  experienceMatch: boolean
  locationMatch: boolean
  jobTypeMatch: boolean
  matchReason: string
}

export interface JobDiscoverRequest {
  targetRole: string
  platforms: JobPlatform[]
  filters: JobFilters
  sortMode?: JobSortMode
  forceRefresh?: boolean
  nextPageToken?: string
  append?: boolean
}

export interface JobRecord {
  id: string
  user_id: string
  platform: string
  title: string
  company: string | null
  company_logo: string | null
  location: string | null
  salary: string | null
  job_type: JobType | null
  work_mode: WorkMode | null
  experience_level: string | null
  description: string | null
  tags: string[]
  match_score: number
  match_details: JobMatchDetails
  job_url: string
  source_url: string | null
  published_at: string | null
  published_at_text: string | null
  discovered_at: string
  applied_status: boolean
  saved_status: boolean
  search_key: string
  fetched_at: string
  created_at: string
  updated_at: string
}

export interface ProfileJobContext {
  role: string
  skills: string[]
  techStack: string[]
  location: string | null
  experienceLevel: string
  yearsOfExperience: number
  topSkills: string[]
  prefersRemote: boolean
  educationKeyword: string | null
}

export interface JobSearchMeta {
  targetRole: string
  location: string
  platforms: string[]
}

export interface JobSearchPagination {
  hasMore: boolean
  nextPageToken: string | null
}

export interface JobSearchApiSuccess {
  success: true
  jobs: JobRecord[]
  total: number
  search: JobSearchMeta
  pagination: JobSearchPagination
  meta: {
    provider: "serpapi"
    searchTimeMs: number
    cached: boolean
  }
}

export interface JobSearchApiFailure {
  success: false
  error: {
    code: JobSearchErrorCode
    message: string
  }
}

export type JobSearchApiResponse = JobSearchApiSuccess | JobSearchApiFailure

export interface JobDiscoverResponse {
  jobs: JobRecord[]
  cached: boolean
  fetchedAt: string | null
  sortMode: JobSortMode
  pagination: JobSearchPagination
  total: number
}

export interface JobActivityItem {
  id: string
  label: string
  timestamp: string
  type: "resume" | "saved" | "applied"
}

/** Legacy shape used by secondary filters; primary search uses SerpApi normalizer. */
export interface JobSearchResult {
  title: string
  company: string | null
  url: string
  snippet: string
  source: string
  platform: JobPlatform | "unknown"
  position: number
  publishedAt: string | null
  publishedAtText: string | null
  searchPlatform?: JobPlatform
}

export interface NormalizedJobInput {
  platform: string
  title: string
  company: string | null
  location?: string
  salary?: string
  description?: string
  job_url: string
  source_url?: string
  company_logo?: string
}