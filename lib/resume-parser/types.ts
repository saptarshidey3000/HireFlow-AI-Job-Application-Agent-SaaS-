import type { LinkType } from "@/lib/supabase/database.types"

export interface ParsedPersonalInfo {
  fullName: string | null
  email: string | null
  phone: string | null
  location: string | null
}

export interface ParsedWorkExperience {
  company: string
  title: string
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  responsibilities: string[]
}

export interface ParsedEducation {
  institution: string
  degree: string | null
  fieldOfStudy: string | null
  startDate: string | null
  endDate: string | null
}

export interface ParsedProject {
  name: string
  description: string | null
  url: string | null
  technologies: string[]
}

export interface ParsedCertification {
  name: string
  issuer: string | null
  issuedDate: string | null
  url: string | null
}

export interface ParsedLink {
  type: LinkType
  label: string | null
  url: string
}

export interface ParsedResume {
  personalInfo: ParsedPersonalInfo
  professionalSummary: string | null
  skills: string[]
  workExperiences: ParsedWorkExperience[]
  education: ParsedEducation[]
  projects: ParsedProject[]
  certifications: ParsedCertification[]
  links: ParsedLink[]
}

export interface ResumeParser {
  parse(buffer: Buffer, mimeType: string): Promise<ParsedResume>
}

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export type AllowedResumeMimeType = (typeof ALLOWED_RESUME_MIME_TYPES)[number]

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024

export function isAllowedResumeMimeType(
  mimeType: string
): mimeType is AllowedResumeMimeType {
  return (ALLOWED_RESUME_MIME_TYPES as readonly string[]).includes(mimeType)
}
