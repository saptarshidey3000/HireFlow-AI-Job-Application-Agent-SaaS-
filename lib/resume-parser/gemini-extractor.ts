import { GoogleGenAI } from "@google/genai"

import { parsedResumeJsonSchema } from "@/lib/resume-parser/schema"
import type { ParsedResume } from "@/lib/resume-parser/types"

const GEMINI_MODEL = "gemini-3.1-flash-lite"

const EXTRACTION_PROMPT = `You are a resume parsing assistant. Extract structured information from the resume text below.

Rules:
- Return only factual information present in the resume.
- Use null for missing scalar fields and empty arrays for missing lists.
- Normalize dates to "YYYY", "YYYY-MM", or human-readable ranges like "Jan 2020 — Present".
- For work experience, extract bullet points into responsibilities.
- Infer link types: linkedin, github, portfolio, or other.
- Do not invent or hallucinate information.

Resume text:
`

export async function extractStructuredResume(text: string): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.")
  }

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: EXTRACTION_PROMPT + text,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: parsedResumeJsonSchema,
    },
  })

  const raw = response.text?.trim()
  if (!raw) {
    throw new Error("Gemini returned an empty response.")
  }

  let parsed: ParsedResume
  try {
    parsed = JSON.parse(raw) as ParsedResume
  } catch {
    throw new Error("Failed to parse structured resume data from Gemini.")
  }

  return {
    personalInfo: {
      fullName: parsed.personalInfo?.fullName ?? null,
      email: parsed.personalInfo?.email ?? null,
      phone: parsed.personalInfo?.phone ?? null,
      location: parsed.personalInfo?.location ?? null,
    },
    professionalSummary: parsed.professionalSummary ?? null,
    skills: parsed.skills ?? [],
    workExperiences: parsed.workExperiences ?? [],
    education: parsed.education ?? [],
    projects: parsed.projects ?? [],
    certifications: parsed.certifications ?? [],
    links: parsed.links ?? [],
  }
}
