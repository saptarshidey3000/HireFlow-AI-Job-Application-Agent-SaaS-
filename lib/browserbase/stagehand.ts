import { Stagehand } from "@browserbasehq/stagehand"
import { z } from "zod"

import { detectPlatformFromUrl } from "@/lib/browserbase/detector"
import type { DetectFieldsResult, SupportedPlatform } from "@/lib/browserbase/types"
import type { DetectedFormField } from "@/lib/supabase/database.types"

export function getBrowserbaseSessionUrl(sessionId?: string | null): string | null {
  if (!sessionId) return null
  return `https://www.browserbase.com/sessions/${sessionId}`
}

export function isBrowserbaseConfigured(): boolean {
  return Boolean(process.env.BROWSERBASE_API_KEY)
}

/**
 * Creates and initializes a Stagehand instance with Browserbase.
 */
export async function createStagehandInstance(): Promise<Stagehand> {
  const apiKey = process.env.BROWSERBASE_API_KEY
  const projectId = process.env.BROWSERBASE_PROJECT_ID

  const stagehand = new Stagehand({
    env: apiKey ? "BROWSERBASE" : "LOCAL",
    apiKey: apiKey || undefined,
    projectId: projectId || undefined,
    verbose: 1,
  })

  await stagehand.init()
  return stagehand
}

const FormFieldExtractionSchema = z.object({
  fields: z.array(
    z.object({
      id: z.string().describe("Unique identifier or input name for the field"),
      name: z.string().describe("Field name or attribute"),
      label: z.string().describe("Visible label text for the field"),
      type: z
        .enum([
          "text",
          "email",
          "phone",
          "file",
          "select",
          "textarea",
          "checkbox",
          "radio",
          "url",
        ])
        .describe("Type of input element"),
      required: z.boolean().describe("Whether this field is mandatory/required to submit"),
      options: z.array(z.string()).optional().describe("Options for select, radio, or multi-choice fields"),
      placeholder: z.string().optional().describe("Placeholder text if present"),
      selector: z.string().optional().describe("CSS selector for targeting this element"),
    })
  ),
})

/**
 * Inspects a job application URL using Browserbase + Stagehand and extracts all required and optional form fields.
 */
export async function detectJobApplicationFields(
  jobUrl: string
): Promise<DetectFieldsResult> {
  const platformInfo = detectPlatformFromUrl(jobUrl)
  let stagehand: Stagehand | null = null
  let sessionId: string | undefined

  try {
    if (!isBrowserbaseConfigured()) {
      // Fallback extraction when running without Browserbase credentials
      return {
        platform: platformInfo.platform,
        fields: getStandardPlatformFields(platformInfo.platform),
      }
    }

    stagehand = await createStagehandInstance()
    sessionId = stagehand.browserbaseSessionId

    const page = stagehand.context.activePage() || (await stagehand.context.newPage())
    await page.goto(jobUrl, { waitUntil: "domcontentloaded", timeoutMs: 45000 })

    // Wait for form elements to appear
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Stagehand extract structured fields using LLM + DOM
    const extraction = await stagehand.extract(
      "Extract all form input fields required or optional for applying to this job, including personal info (first name, last name, email, phone, location), resume upload, LinkedIn/GitHub/portfolio links, cover letter/summary, work experience, and any platform-specific screening questions. Mark required=true if marked with an asterisk (*), 'required', or mandatory validation.",
      FormFieldExtractionSchema
    )

    const rawFields = extraction?.fields ?? []
    const fields: DetectedFormField[] = rawFields.map((f) => ({
      id: f.id || f.name || `field_${Math.random().toString(36).slice(2, 8)}`,
      name: f.name || f.id || "unknown",
      label: f.label || f.name || "Field",
      type: f.type || "text",
      required: Boolean(f.required),
      options: f.options,
      placeholder: f.placeholder,
      selector: f.selector,
    }))

    // If Stagehand extracted zero fields, fallback to DOM evaluation
    if (fields.length === 0) {
      const domFields = await extractFieldsFromDom(stagehand)
      return {
        platform: platformInfo.platform,
        sessionId,
        sessionUrl: getBrowserbaseSessionUrl(sessionId) || undefined,
        fields: domFields.length > 0 ? domFields : getStandardPlatformFields(platformInfo.platform),
      }
    }

    return {
      platform: platformInfo.platform,
      sessionId,
      sessionUrl: getBrowserbaseSessionUrl(sessionId) || undefined,
      fields,
    }
  } catch (error) {
    console.error("Error detecting job form fields with Stagehand:", error)
    return {
      platform: platformInfo.platform,
      sessionId,
      sessionUrl: getBrowserbaseSessionUrl(sessionId) || undefined,
      fields: getStandardPlatformFields(platformInfo.platform),
      error: error instanceof Error ? error.message : "Failed to detect fields via browser agent.",
    }
  } finally {
    if (stagehand) {
      try {
        await stagehand.close()
      } catch {
        // ignore close error
      }
    }
  }
}

/**
 * Extracts form fields directly from the DOM using page evaluation.
 */
async function extractFieldsFromDom(stagehand: Stagehand): Promise<DetectedFormField[]> {
  try {
    const page = stagehand.context.activePage()
    if (!page) return []

    return await page.mainFrame().evaluate(() => {
      const results: Array<{
        id: string
        name: string
        label: string
        type: "text" | "email" | "phone" | "file" | "select" | "textarea" | "checkbox" | "radio" | "url"
        required: boolean
        placeholder?: string
      }> = []

      const inputs = document.querySelectorAll("input, select, textarea")
      inputs.forEach((el, index) => {
        const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        const typeAttr = (input.getAttribute("type") || input.tagName.toLowerCase()).toLowerCase()
        if (["hidden", "submit", "button", "image", "reset"].includes(typeAttr)) return

        const id = input.id || input.name || `input_${index}`
        const name = input.name || input.id || `field_${index}`

        // Find label
        let labelText = ""
        if (input.id) {
          const labelEl = document.querySelector(`label[for='${input.id}']`)
          if (labelEl) labelText = labelEl.textContent?.trim() || ""
        }
        if (!labelText) {
          const parentLabel = input.closest("label")
          if (parentLabel) labelText = parentLabel.textContent?.trim() || ""
        }
        if (!labelText && input.getAttribute("aria-label")) {
          labelText = input.getAttribute("aria-label") || ""
        }
        if (!labelText && input.getAttribute("placeholder")) {
          labelText = input.getAttribute("placeholder") || ""
        }
        if (!labelText) {
          labelText = name
        }

        const isRequired =
          input.hasAttribute("required") ||
          input.getAttribute("aria-required") === "true" ||
          labelText.includes("*") ||
          labelText.toLowerCase().includes("required")

        let fieldType: "text" | "email" | "phone" | "file" | "select" | "textarea" | "checkbox" | "radio" | "url" = "text"
        if (typeAttr === "file") fieldType = "file"
        else if (typeAttr === "email") fieldType = "email"
        else if (typeAttr === "tel" || typeAttr === "phone") fieldType = "phone"
        else if (typeAttr === "url") fieldType = "url"
        else if (typeAttr === "checkbox") fieldType = "checkbox"
        else if (typeAttr === "radio") fieldType = "radio"
        else if (input.tagName.toLowerCase() === "textarea") fieldType = "textarea"
        else if (input.tagName.toLowerCase() === "select") fieldType = "select"

        results.push({
          id,
          name,
          label: labelText.replace(/\*/g, "").trim(),
          type: fieldType,
          required: isRequired,
          placeholder: input.getAttribute("placeholder") || undefined,
        })
      })

      return results
    })
  } catch {
    return []
  }
}

/**
 * Standard known fields for supported ATS platforms as high-confidence baseline.
 */
function getStandardPlatformFields(platform: SupportedPlatform): DetectedFormField[] {
  const commonFields: DetectedFormField[] = [
    { id: "first_name", name: "first_name", label: "First Name", type: "text", required: true },
    { id: "last_name", name: "last_name", label: "Last Name", type: "text", required: true },
    { id: "email", name: "email", label: "Email", type: "email", required: true },
    { id: "phone", name: "phone", label: "Phone", type: "phone", required: true },
    { id: "resume", name: "resume", label: "Resume/CV", type: "file", required: true },
    { id: "location", name: "location", label: "Location", type: "text", required: false },
    { id: "linkedin", name: "linkedin", label: "LinkedIn URL", type: "url", required: false },
    { id: "github", name: "github", label: "GitHub URL", type: "url", required: false },
    { id: "portfolio", name: "portfolio", label: "Portfolio URL", type: "url", required: false },
    { id: "summary", name: "summary", label: "Cover Letter / Summary", type: "textarea", required: false },
  ]

  switch (platform) {
    case "greenhouse":
      return [
        { id: "first_name", name: "first_name", label: "First Name", type: "text", required: true },
        { id: "last_name", name: "last_name", label: "Last Name", type: "text", required: true },
        { id: "email", name: "email", label: "Email", type: "email", required: true },
        { id: "phone", name: "phone", label: "Phone", type: "phone", required: true },
        { id: "resume", name: "resume", label: "Resume", type: "file", required: true },
        { id: "cover_letter", name: "cover_letter", label: "Cover Letter", type: "file", required: false },
        { id: "linkedin", name: "job_application[answers_attributes][0][text_value]", label: "LinkedIn Profile", type: "url", required: false },
        { id: "website", name: "job_application[answers_attributes][1][text_value]", label: "Website", type: "url", required: false },
      ]
    case "lever":
      return [
        { id: "name", name: "name", label: "Full Name", type: "text", required: true },
        { id: "email", name: "email", label: "Email", type: "email", required: true },
        { id: "phone", name: "phone", label: "Phone", type: "phone", required: true },
        { id: "org", name: "org", label: "Current Company", type: "text", required: false },
        { id: "resume", name: "resume", label: "Resume/CV", type: "file", required: true },
        { id: "urls[LinkedIn]", name: "urls[LinkedIn]", label: "LinkedIn URL", type: "url", required: false },
        { id: "urls[GitHub]", name: "urls[GitHub]", label: "GitHub URL", type: "url", required: false },
        { id: "urls[Portfolio]", name: "urls[Portfolio]", label: "Portfolio URL", type: "url", required: false },
        { id: "comments", name: "comments", label: "Additional Information", type: "textarea", required: false },
      ]
    case "workable":
      return [
        { id: "firstname", name: "firstname", label: "First Name", type: "text", required: true },
        { id: "lastname", name: "lastname", label: "Last Name", type: "text", required: true },
        { id: "email", name: "email", label: "Email", type: "email", required: true },
        { id: "phone", name: "phone", label: "Phone", type: "phone", required: true },
        { id: "resume", name: "resume", label: "Resume", type: "file", required: true },
        { id: "summary", name: "summary", label: "Summary", type: "textarea", required: false },
        { id: "address", name: "address", label: "Address", type: "text", required: false },
      ]
    case "ashby":
      return [
        { id: "name", name: "name", label: "Full Name", type: "text", required: true },
        { id: "email", name: "email", label: "Email", type: "email", required: true },
        { id: "phone", name: "phone", label: "Phone Number", type: "phone", required: true },
        { id: "resume", name: "resume", label: "Resume", type: "file", required: true },
        { id: "linkedinUrl", name: "linkedinUrl", label: "LinkedIn URL", type: "url", required: false },
        { id: "githubUrl", name: "githubUrl", label: "GitHub URL", type: "url", required: false },
      ]
    default:
      return commonFields
  }
}
