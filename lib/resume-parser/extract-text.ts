import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import "pdf-parse/worker";

import {
  isAllowedResumeMimeType,
  type AllowedResumeMimeType,
} from "@/lib/resume-parser/types"

export async function extractTextFromResume(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!isAllowedResumeMimeType(mimeType)) {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX file.")
  }

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      const text = result.text?.trim()
      if (!text) {
        throw new Error("Could not extract text from the PDF resume.")
      }
      return text
    } finally {
      await parser.destroy()
    }
  }

  const result = await mammoth.extractRawText({ buffer })
  const text = result.value?.trim()
  if (!text) {
    throw new Error("Could not extract text from the DOCX resume.")
  }
  return text
}

export function getFileExtension(mimeType: AllowedResumeMimeType): string {
  return mimeType === "application/pdf" ? "pdf" : "docx"
}
