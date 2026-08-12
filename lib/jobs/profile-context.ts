import type { FullProfile } from "@/lib/supabase/database.types"
import type { ProfileJobContext } from "@/lib/jobs/types"

function parseYear(value: string | null | undefined): number | null {
  if (!value?.trim()) return null
  const match = value.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : null
}

function inferYearsOfExperience(profile: FullProfile): number {
  const currentYear = new Date().getFullYear()
  let totalYears = 0

  for (const role of profile.workExperiences) {
    const start = parseYear(role.start_date)
    const end = role.is_current ? currentYear : parseYear(role.end_date)
    if (start && end && end >= start) {
      totalYears += Math.max(1, end - start + 1)
    }
  }

  if (totalYears > 0) return Math.min(totalYears, 30)
  return profile.workExperiences.length > 0 ? 1 : 0
}

function inferExperienceLevel(
  profile: FullProfile,
  years: number
): string {
  if (years <= 1) return "Entry Level"
  if (years <= 3) return "Junior"
  if (years <= 6) return "Mid Level"
  return "Senior"
}

function inferRole(profile: FullProfile): string {
  const latest = profile.workExperiences[0]
  if (latest?.title?.trim()) return latest.title.trim()

  const summary = profile.profile.professional_summary?.trim() ?? ""
  if (summary.length > 0) {
    const firstSentence = summary.split(/[.!?\n]/)[0]?.trim() ?? ""
    if (firstSentence.length >= 8 && firstSentence.length <= 80) {
      return firstSentence
    }
  }

  return "Software Developer"
}

function inferEducationKeyword(profile: FullProfile): string | null {
  const latest = profile.education[0]
  if (!latest) return null

  const degree = latest.degree?.trim()
  const field = latest.field_of_study?.trim()

  if (degree && /computer|software|engineering|technology|information/i.test(degree)) {
    return degree
  }

  if (field && /computer|software|engineering|technology|information/i.test(field)) {
    return field
  }

  return null
}

export function buildProfileJobContext(
  profile: FullProfile,
  filters?: { workModes?: string[] }
): ProfileJobContext {
  const skills = profile.skills.map((s) => s.name.trim()).filter(Boolean)
  const projectTech = profile.projects.flatMap((p) => p.technologies ?? [])
  const techStack = Array.from(
    new Set([...skills, ...projectTech].map((item) => item.trim()).filter(Boolean))
  ).slice(0, 12)

  const yearsOfExperience = inferYearsOfExperience(profile)
  const prefersRemote = Boolean(filters?.workModes?.includes("remote"))

  return {
    role: inferRole(profile),
    skills,
    techStack,
    location: profile.profile.location?.trim() || null,
    experienceLevel: inferExperienceLevel(profile, yearsOfExperience),
    yearsOfExperience,
    topSkills: skills.slice(0, 5),
    prefersRemote,
    educationKeyword: inferEducationKeyword(profile),
  }
}
