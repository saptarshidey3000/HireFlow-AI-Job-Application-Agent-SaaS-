export type JobPlatform =
  | "greenhouse"
  | "upwork"
  | "workable"
  | "wellfound"
  | "internshala"
  | "indeed"
  | "linkedin"

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

export type JobTypeFilter = "full-time" | "part-time" | "internship"
export type WorkModeFilter = "remote" | "hybrid" | "on-campus"

export interface JobFilters {
  jobTypes: JobTypeFilter[]
  workModes: WorkModeFilter[]
  location?: string
  experienceLevel?: string
  salaryMin?: string
  skills?: string[]
  postedWithin?: string
}

export interface JobDiscoverRequest {
  platforms: JobPlatform[]
  filters: JobFilters
  forceRefresh?: boolean
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
  job_url: string
  source_url: string | null
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

export interface CrawleoSearchResult {
  title: string
  link: string
  snippet: string
  position: number
}

export interface JobSearchResult {
  title: string
  company: string | null
  url: string
  snippet: string
  source: string
  platform: JobPlatform | "unknown"
  position: number
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

export interface JobDiscoverResponse {
  jobs: JobRecord[]
  cached: boolean
  fetchedAt: string | null
}

export interface JobActivityItem {
  id: string
  label: string
  timestamp: string
  type: "resume" | "saved" | "applied"
}

export type JobSearchErrorCode = "JOB_SEARCH_UNAVAILABLE" | "UNAUTHORIZED" | "PROFILE_REQUIRED"
