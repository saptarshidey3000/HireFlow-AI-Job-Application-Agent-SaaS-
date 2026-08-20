import type { FullProfile } from "@/lib/supabase/database.types"

export type ProfileSectionId =
  | "personal"
  | "summary"
  | "skills"
  | "work"
  | "education"
  | "projects"
  | "certifications"
  | "links"

export interface ProfileSectionCompleteness {
  id: ProfileSectionId
  label: string
  percent: number
  complete: boolean
  hint: string
}

export interface ProfileCompletenessResult {
  percent: number
  sections: ProfileSectionCompleteness[]
  completedCount: number
  totalSections: number
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function scorePersonal(profile: FullProfile): ProfileSectionCompleteness {
  const fields = [
    Boolean(profile.profile.full_name?.trim()),
    Boolean(profile.profile.phone?.trim()),
    Boolean(profile.profile.location?.trim()),
  ]
  const filled = fields.filter(Boolean).length
  const percent = clampPercent((filled / fields.length) * 100)

  return {
    id: "personal",
    label: "Personal Information",
    percent,
    complete: percent === 100,
    hint:
      percent === 100
        ? "Personal details are complete"
        : "Add your name, phone, and location",
  }
}

function scoreSummary(profile: FullProfile): ProfileSectionCompleteness {
  const summary = profile.profile.professional_summary?.trim() ?? ""
  const percent = summary.length >= 40 ? 100 : summary.length > 0 ? 60 : 0

  return {
    id: "summary",
    label: "Professional Summary",
    percent,
    complete: percent === 100,
    hint:
      percent === 100
        ? "Summary looks good"
        : "Add a professional summary (40+ characters)",
  }
}

function scoreSkills(profile: FullProfile): ProfileSectionCompleteness {
  const count = profile.skills.length
  const percent =
    count >= 5 ? 100 : count >= 3 ? 80 : count >= 1 ? 50 : 0

  return {
    id: "skills",
    label: "Skills",
    percent,
    complete: percent >= 80,
    hint:
      count === 0
        ? "Add at least one skill"
        : count < 5
          ? "Add more skills to strengthen your profile"
          : "Skills section is strong",
  }
}

function scoreWork(profile: FullProfile): ProfileSectionCompleteness {
  const entries = profile.workExperiences.filter(
    (item) => item.company.trim() && item.title.trim()
  )
  const withBullets = entries.filter(
    (item) => item.responsibilities.length > 0
  ).length
  const percent =
    entries.length === 0
      ? 0
      : withBullets >= entries.length
        ? 100
        : clampPercent(60 + (withBullets / entries.length) * 40)

  return {
    id: "work",
    label: "Work Experience",
    percent,
    complete: percent === 100,
    hint:
      entries.length === 0
        ? "Add at least one work experience"
        : withBullets < entries.length
          ? "Add responsibilities to your roles"
          : "Work experience is complete",
  }
}

function scoreEducation(profile: FullProfile): ProfileSectionCompleteness {
  const entries = profile.education.filter((item) => item.institution.trim())
  const withDetails = entries.filter(
    (item) => item.degree?.trim() || item.field_of_study?.trim()
  ).length
  const percent =
    entries.length === 0
      ? 0
      : withDetails >= entries.length
        ? 100
        : 70

  return {
    id: "education",
    label: "Education",
    percent,
    complete: percent === 100,
    hint:
      entries.length === 0
        ? "Add your education history"
        : withDetails < entries.length
          ? "Add degree or field of study"
          : "Education section is complete",
  }
}

function scoreProjects(profile: FullProfile): ProfileSectionCompleteness {
  const entries = profile.projects.filter((item) => item.name.trim())
  const withDetails = entries.filter(
    (item) => item.description?.trim() || item.url?.trim()
  ).length
  const percent =
    entries.length === 0
      ? 0
      : withDetails >= entries.length
        ? 100
        : 65

  return {
    id: "projects",
    label: "Projects",
    percent,
    complete: percent === 100,
    hint:
      entries.length === 0
        ? "Add a project to showcase your work"
        : withDetails < entries.length
          ? "Add descriptions or links to projects"
          : "Projects section is complete",
  }
}

function scoreCertifications(profile: FullProfile): ProfileSectionCompleteness {
  const entries = profile.certifications.filter((item) => item.name.trim())
  const percent = entries.length >= 1 ? 100 : 0

  return {
    id: "certifications",
    label: "Certifications",
    percent,
    complete: percent === 100,
    hint:
      entries.length === 0
        ? "Add certifications (optional but recommended)"
        : "Certifications added",
  }
}

function scoreLinks(profile: FullProfile): ProfileSectionCompleteness {
  const entries = profile.links.filter((item) => item.url.trim())
  const hasLinkedIn = entries.some((item) => item.type === "linkedin")
  const percent =
    entries.length === 0 ? 0 : hasLinkedIn ? 100 : entries.length >= 1 ? 75 : 0

  return {
    id: "links",
    label: "Links",
    percent,
    complete: percent === 100,
    hint:
      entries.length === 0
        ? "Add LinkedIn, GitHub, or portfolio links"
        : !hasLinkedIn
          ? "Consider adding your LinkedIn profile"
          : "Links section is complete",
  }
}

export function calculateProfileCompleteness(
  profile: FullProfile
): ProfileCompletenessResult {
  const sections = [
    scorePersonal(profile),
    scoreSummary(profile),
    scoreSkills(profile),
    scoreWork(profile),
    scoreEducation(profile),
    scoreProjects(profile),
    scoreCertifications(profile),
    scoreLinks(profile),
  ]

  const percent = clampPercent(
    sections.reduce((sum, section) => sum + section.percent, 0) /
      sections.length
  )

  return {
    percent,
    sections,
    completedCount: sections.filter((section) => section.complete).length,
    totalSections: sections.length,
  }
}
