import type { FullProfile, Resume, DetectedFormField, MissingFieldInfo } from "@/lib/supabase/database.types"
import type { ProfileMatchResult } from "@/lib/browserbase/types"

export function matchProfileToFormFields(
  fields: DetectedFormField[],
  fullProfile: FullProfile,
  activeResume: Resume | null
): ProfileMatchResult {
  const { profile, links, workExperiences, education, skills } = fullProfile
  const mappedValues: Record<string, string | boolean | number> = {}
  const missingFields: MissingFieldInfo[] = []
  const missingSet = new Set<string>()

  // Helper getters for profile data
  const fullName = profile.full_name?.trim() || ""
  const nameParts = fullName.split(" ").filter(Boolean)
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  const email = profile.email?.trim() || ""
  const phone = profile.phone?.trim() || ""
  const location = profile.location?.trim() || ""
  const summary = profile.professional_summary?.trim() || ""

  const linkedinLink = links.find(
    (l) => l.type === "linkedin" || l.url.toLowerCase().includes("linkedin.com")
  )?.url?.trim() || ""

  const githubLink = links.find(
    (l) => l.type === "github" || l.url.toLowerCase().includes("github.com")
  )?.url?.trim() || ""

  const portfolioLink = links.find(
    (l) =>
      l.type === "portfolio" ||
      l.type === "other" ||
      l.url.toLowerCase().includes("github.io") ||
      l.url.toLowerCase().includes("vercel.app")
  )?.url?.trim() || ""

  const hasResume = Boolean(activeResume && activeResume.storage_path)

  for (const field of fields) {
    const nameLower = (field.name || "").toLowerCase()
    const labelLower = (field.label || "").toLowerCase()
    const idLower = (field.id || "").toLowerCase()
    const identifier = `${nameLower} ${labelLower} ${idLower}`

    // 1. Resume / CV upload
    if (
      field.type === "file" ||
      identifier.includes("resume") ||
      identifier.includes("cv") ||
      identifier.includes("attach")
    ) {
      if (field.required && !hasResume && !missingSet.has("resume")) {
        missingSet.add("resume")
        missingFields.push({
          fieldKey: "resume",
          label: "Active Resume File",
          section: "resume",
          description: "An active uploaded resume is required to apply.",
        })
      }
      continue
    }

    // 2. Full Name / First Name / Last Name
    if (identifier.includes("first name") || identifier.includes("firstname") || identifier.includes("given_name")) {
      if (firstName) {
        mappedValues[field.id || field.name] = firstName
      } else if (field.required && !missingSet.has("first_name")) {
        missingSet.add("first_name")
        missingFields.push({
          fieldKey: "first_name",
          label: "First Name",
          section: "personal",
          description: "Your first name is required.",
        })
      }
      continue
    }

    if (identifier.includes("last name") || identifier.includes("lastname") || identifier.includes("family_name") || identifier.includes("surname")) {
      if (lastName) {
        mappedValues[field.id || field.name] = lastName
      } else if (field.required && !missingSet.has("last_name")) {
        missingSet.add("last_name")
        missingFields.push({
          fieldKey: "last_name",
          label: "Last Name",
          section: "personal",
          description: "Your last name is required.",
        })
      }
      continue
    }

    if (
      identifier.includes("full name") ||
      identifier.includes("fullname") ||
      (identifier.includes("name") && !identifier.includes("company") && !identifier.includes("school"))
    ) {
      if (fullName) {
        mappedValues[field.id || field.name] = fullName
      } else if (field.required && !missingSet.has("full_name")) {
        missingSet.add("full_name")
        missingFields.push({
          fieldKey: "full_name",
          label: "Full Name",
          section: "personal",
          description: "Your full name is required.",
        })
      }
      continue
    }

    // 3. Email
    if (field.type === "email" || identifier.includes("email") || identifier.includes("e-mail")) {
      if (email) {
        mappedValues[field.id || field.name] = email
      } else if (field.required && !missingSet.has("email")) {
        missingSet.add("email")
        missingFields.push({
          fieldKey: "email",
          label: "Email Address",
          section: "personal",
          description: "A valid email address is required.",
        })
      }
      continue
    }

    // 4. Phone
    if (
      field.type === "phone" ||
      identifier.includes("phone") ||
      identifier.includes("mobile") ||
      identifier.includes("telephone") ||
      identifier.includes("contact number")
    ) {
      if (phone) {
        mappedValues[field.id || field.name] = phone
      } else if (field.required && !missingSet.has("phone")) {
        missingSet.add("phone")
        missingFields.push({
          fieldKey: "phone",
          label: "Phone Number",
          section: "personal",
          description: "Your phone number is required by this application form.",
        })
      }
      continue
    }

    // 5. Location / Address / City
    if (
      identifier.includes("location") ||
      identifier.includes("city") ||
      identifier.includes("address") ||
      identifier.includes("country")
    ) {
      if (location) {
        mappedValues[field.id || field.name] = location
      } else if (field.required && !missingSet.has("location")) {
        missingSet.add("location")
        missingFields.push({
          fieldKey: "location",
          label: "Current Location / City",
          section: "personal",
          description: "Your location / city is required.",
        })
      }
      continue
    }

    // 6. LinkedIn URL
    if (identifier.includes("linkedin") || identifier.includes("linked_in")) {
      if (linkedinLink) {
        mappedValues[field.id || field.name] = linkedinLink
      } else if (field.required && !missingSet.has("linkedin")) {
        missingSet.add("linkedin")
        missingFields.push({
          fieldKey: "linkedin",
          label: "LinkedIn Profile URL",
          section: "links",
          description: "Your LinkedIn profile URL is required.",
        })
      }
      continue
    }

    // 7. GitHub URL
    if (identifier.includes("github") || identifier.includes("git_hub")) {
      if (githubLink) {
        mappedValues[field.id || field.name] = githubLink
      } else if (field.required && !missingSet.has("github")) {
        missingSet.add("github")
        missingFields.push({
          fieldKey: "github",
          label: "GitHub Profile URL",
          section: "links",
          description: "Your GitHub profile URL is required.",
        })
      }
      continue
    }

    // 8. Portfolio / Website URL
    if (
      identifier.includes("portfolio") ||
      identifier.includes("website") ||
      identifier.includes("personal link") ||
      identifier.includes("blog")
    ) {
      if (portfolioLink || githubLink || linkedinLink) {
        mappedValues[field.id || field.name] = portfolioLink || githubLink || linkedinLink
      } else if (field.required && !missingSet.has("portfolio")) {
        missingSet.add("portfolio")
        missingFields.push({
          fieldKey: "portfolio",
          label: "Portfolio / Website URL",
          section: "links",
          description: "Your portfolio or personal website link is required.",
        })
      }
      continue
    }

    // 9. Professional Summary / Cover letter
    if (
      identifier.includes("cover letter") ||
      identifier.includes("summary") ||
      identifier.includes("about you") ||
      identifier.includes("note to hiring manager") ||
      identifier.includes("additional information")
    ) {
      if (summary) {
        mappedValues[field.id || field.name] = summary
      } else if (field.required && !missingSet.has("summary")) {
        missingSet.add("summary")
        missingFields.push({
          fieldKey: "summary",
          label: "Professional Summary",
          section: "summary",
          description: "A summary or note is required by this application form.",
        })
      }
      continue
    }

    // 10. Work Experience / Current Company
    if (identifier.includes("current company") || identifier.includes("recent employer")) {
      const currentCompany = workExperiences[0]?.company || ""
      if (currentCompany) {
        mappedValues[field.id || field.name] = currentCompany
      } else if (field.required && !missingSet.has("work")) {
        missingSet.add("work")
        missingFields.push({
          fieldKey: "work",
          label: "Work Experience",
          section: "work",
          description: "Company / work experience is required.",
        })
      }
      continue
    }

    // 11. Education / School / University
    if (identifier.includes("school") || identifier.includes("university") || identifier.includes("education")) {
      const school = education[0]?.institution || ""
      if (school) {
        mappedValues[field.id || field.name] = school
      } else if (field.required && !missingSet.has("education")) {
        missingSet.add("education")
        missingFields.push({
          fieldKey: "education",
          label: "Education Details",
          section: "education",
          description: "School or University name is required.",
        })
      }
      continue
    }

    // 12. Skills / Technologies
    if (identifier.includes("skills") || identifier.includes("technologies") || identifier.includes("tech stack")) {
      const skillNames = skills.map((s) => s.name).join(", ")
      if (skillNames) {
        mappedValues[field.id || field.name] = skillNames
      }
      continue
    }
  }

  return {
    isComplete: missingFields.length === 0,
    mappedValues,
    missingFields,
  }
}
