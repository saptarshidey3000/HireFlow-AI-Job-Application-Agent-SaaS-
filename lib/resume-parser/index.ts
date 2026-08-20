import { extractTextFromResume } from "@/lib/resume-parser/extract-text"
import { extractStructuredResume } from "@/lib/resume-parser/gemini-extractor"
import type { ParsedResume, ResumeParser } from "@/lib/resume-parser/types"

class GeminiResumeParser implements ResumeParser {
  async parse(buffer: Buffer, mimeType: string): Promise<ParsedResume> {
    const text = await extractTextFromResume(buffer, mimeType)
    return extractStructuredResume(text)
  }
}

export function createResumeParser(): ResumeParser {
  return new GeminiResumeParser()
}

export { extractTextFromResume, extractStructuredResume }
