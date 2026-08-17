import type { DetectedFormField, MissingFieldInfo } from "@/lib/supabase/database.types"

export type SupportedPlatform =
  | "greenhouse"
  | "lever"
  | "workable"
  | "ashby"
  | "smartrecruiters"
  | "bamboohr"
  | "jobvite"
  | "generic"

export interface PlatformInfo {
  platform: SupportedPlatform
  name: string
  isSupported: boolean
  formSelector?: string
  submitSelector?: string
}

export interface DetectFieldsResult {
  platform: SupportedPlatform
  sessionId?: string
  sessionUrl?: string
  fields: DetectedFormField[]
  error?: string
}

export interface AutofillData {
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  location?: string
  summary?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  resumeUrl?: string
  resumeFileName?: string
  resumeBase64?: string
  workExperiences?: Array<{
    company: string
    title: string
    startDate?: string | null
    endDate?: string | null
    isCurrent: boolean
    responsibilities: string[]
  }>
  education?: Array<{
    institution: string
    degree?: string | null
    fieldOfStudy?: string | null
    startDate?: string | null
    endDate?: string | null
  }>
  skills?: string[]
}

export interface ProfileMatchResult {
  isComplete: boolean
  mappedValues: Record<string, string | boolean | number>
  missingFields: MissingFieldInfo[]
}

export interface ApplicationSubmissionResult {
  success: boolean
  sessionId?: string
  sessionUrl?: string
  confirmationMessage?: string
  error?: string
}
