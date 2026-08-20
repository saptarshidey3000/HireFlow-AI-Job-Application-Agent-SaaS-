import { GoogleGenAI } from "@google/genai"

import type { JobMatchDetails, ProfileJobContext } from "@/lib/jobs/types"

const GEMINI_MODEL = "gemini-3.1-flash-lite"
const TOP_AI_CANDIDATES = 10

interface GeminiMatchResponse {
  matchScore?: number
  matchedSkills?: string[]
  missingSkills?: string[]
  reason?: string
}

interface JobMatchCandidate {
  title: string
  snippet: string
  matchScore: number
  matchDetails: JobMatchDetails
}

function normalizeList(values: string[] | undefined): string[] {
  return Array.from(
    new Set((values ?? []).map((value) => value.trim()).filter(Boolean))
  )
}

function validateGeminiResponse(
  raw: GeminiMatchResponse,
  allowedSkills: Set<string>,
  deterministicScore: number
): Partial<JobMatchDetails> | null {
  const matchedSkills = normalizeList(raw.matchedSkills).filter((skill) =>
    allowedSkills.has(skill.toLowerCase())
  )
  const missingSkills = normalizeList(raw.missingSkills).filter((skill) =>
    allowedSkills.has(skill.toLowerCase())
  )

  const reason = typeof raw.reason === "string" ? raw.reason.trim() : ""
  if (!reason) return null

  const score =
    typeof raw.matchScore === "number" && Number.isFinite(raw.matchScore)
      ? Math.max(0, Math.min(100, Math.round(raw.matchScore)))
      : null

  if (score !== null && Math.abs(score - deterministicScore) > 25) {
    return {
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : undefined,
      missingSkills: missingSkills.length > 0 ? missingSkills : undefined,
      matchReason: reason.slice(0, 400),
    }
  }

  return {
    matchedSkills: matchedSkills.length > 0 ? matchedSkills : undefined,
    missingSkills: missingSkills.length > 0 ? missingSkills : undefined,
    matchReason: reason.slice(0, 400),
  }
}

export async function refineTopMatchesWithGemini(
  targetRole: string,
  context: ProfileJobContext,
  candidates: Array<JobMatchCandidate & { jobUrl: string }>
): Promise<Map<string, Partial<JobMatchDetails>>> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey || candidates.length === 0) {
    return new Map()
  }

  const topCandidates = candidates
    .slice()
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, TOP_AI_CANDIDATES)

  const allowedSkills = new Set(
    [...context.skills, ...context.techStack].map((skill) => skill.toLowerCase())
  )

  const ai = new GoogleGenAI({ apiKey })
  const refinements = new Map<string, Partial<JobMatchDetails>>()

  await Promise.all(
    topCandidates.map(async (candidate) => {
      const prompt = `You analyze whether a Google job search result matches a candidate profile.

Rules:
- Use ONLY the provided candidate skills and job title/snippet.
- Do not invent company names, requirements, or skills not hinted in the snippet.
- matchedSkills and missingSkills must come from the candidate skill list.
- Return concise JSON only.

Candidate target role: ${targetRole}
Candidate skills: ${context.skills.slice(0, 10).join(", ") || "none"}
Candidate technologies: ${context.techStack.slice(0, 8).join(", ") || "none"}
Experience level: ${context.experienceLevel}

Job title: ${candidate.title}
Job snippet: ${candidate.snippet}

Return JSON:
{
  "matchScore": number,
  "matchedSkills": string[],
  "missingSkills": string[],
  "reason": string
}`

      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        })

        const rawText = response.text?.trim()
        if (!rawText) return

        const parsed = JSON.parse(rawText) as GeminiMatchResponse
        const validated = validateGeminiResponse(
          parsed,
          allowedSkills,
          candidate.matchScore
        )

        if (validated) {
          refinements.set(candidate.jobUrl, validated)
        }
      } catch (error) {
        console.error("[jobs/gemini-matching]", error)
      }
    })
  )

  return refinements
}

export function mergeGeminiRefinement(
  deterministic: JobMatchDetails,
  refinement: Partial<JobMatchDetails> | undefined
): JobMatchDetails {
  if (!refinement) return deterministic

  return {
    ...deterministic,
    matchedSkills: refinement.matchedSkills ?? deterministic.matchedSkills,
    missingSkills: refinement.missingSkills ?? deterministic.missingSkills,
    matchReason: refinement.matchReason ?? deterministic.matchReason,
  }
}
