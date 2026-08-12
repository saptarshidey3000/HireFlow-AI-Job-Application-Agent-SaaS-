"use server"

import { revalidatePath } from "next/cache"

import {
  actionError,
  actionSuccess,
  buildStoragePath,
  saveParsedProfile,
  type ActionResult,
} from "@/lib/actions/helpers"
import { getAuthenticatedSupabase } from "@/lib/auth/session"
import { getResumeById } from "@/lib/data/resume"
import { createResumeParser } from "@/lib/resume-parser"
import {
  isAllowedResumeMimeType,
  MAX_RESUME_FILE_SIZE,
} from "@/lib/resume-parser/types"
import type { ParsingStatus, Resume } from "@/lib/supabase/database.types"

const RESUME_BUCKET = "resumes"

async function updateResumeStatus(
  resumeId: string,
  userId: string,
  status: ParsingStatus,
  parsingError: string | null = null
) {
  const { supabase } = await getAuthenticatedSupabase()
  const { error } = await supabase
    .from("resumes")
    .update({
      parsing_status: status,
      parsing_error: parsingError,
    })
    .eq("id", resumeId)
    .eq("user_id", userId)

  if (error) throw error
}

export async function uploadResume(
  formData: FormData
): Promise<ActionResult<{ resumeId: string }>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return actionError("No file provided.")
    }

    if (!isAllowedResumeMimeType(file.type)) {
      return actionError("Please upload a PDF or DOCX file.")
    }

    if (file.size > MAX_RESUME_FILE_SIZE) {
      return actionError("File size must be 10 MB or less.")
    }

    await supabase
      .from("resumes")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("is_active", true)

    const { data: resume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: userId,
        file_name: file.name,
        storage_path: "pending",
        file_type: file.type,
        file_size: file.size,
        parsing_status: "uploading",
        is_active: true,
      })
      .select("*")
      .single()

    if (insertError || !resume) {
      return actionError(insertError?.message ?? "Failed to create resume record.")
    }

    const storagePath = buildStoragePath(userId, resume.id, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      await supabase.from("resumes").delete().eq("id", resume.id)
      return actionError(uploadError.message)
    }

    const { error: updateError } = await supabase
      .from("resumes")
      .update({
        storage_path: storagePath,
        parsing_status: "processing",
      })
      .eq("id", resume.id)
      .eq("user_id", userId)

    if (updateError) {
      return actionError(updateError.message)
    }

    revalidatePath("/dashboard/resume")
    return actionSuccess({ resumeId: resume.id })
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to upload resume."
    )
  }
}

export async function parseResume(
  resumeId: string
): Promise<ActionResult<{ status: ParsingStatus }>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const resume = await getResumeById(supabase, resumeId, userId)

    if (!resume) {
      return actionError("Resume not found.")
    }

    await updateResumeStatus(resumeId, userId, "parsing")

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .download(resume.storage_path)

    if (downloadError || !fileData) {
      await updateResumeStatus(
        resumeId,
        userId,
        "error",
        downloadError?.message ?? "Failed to download resume."
      )
      return actionError("Failed to download resume for parsing.")
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const parser = createResumeParser()
    const parsed = await parser.parse(buffer, resume.file_type)

    await updateResumeStatus(resumeId, userId, "saving_profile")
    await saveParsedProfile(supabase, userId, parsed)

    await updateResumeStatus(resumeId, userId, "complete")

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profile")
    revalidatePath("/dashboard/resume")

    return actionSuccess({ status: "complete" })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse resume."

    try {
      const { userId } = await getAuthenticatedSupabase()
      await updateResumeStatus(resumeId, userId, "error", message)
    } catch {
      // Ignore secondary failure
    }

    return actionError(message)
  }
}

export async function replaceResume(
  formData: FormData
): Promise<ActionResult<{ resumeId: string }>> {
  const uploadResult = await uploadResume(formData)
  if (!uploadResult.success) return uploadResult

  const parseResult = await parseResume(uploadResult.data.resumeId)
  if (!parseResult.success) return parseResult

  return uploadResult
}

export async function getResumeStatus(
  resumeId: string
): Promise<ActionResult<Resume>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const resume = await getResumeById(supabase, resumeId, userId)

    if (!resume) {
      return actionError("Resume not found.")
    }

    return actionSuccess(resume)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to fetch resume status."
    )
  }
}

export async function getResumeDownloadUrl(
  resumeId: string
): Promise<ActionResult<{ url: string; fileName: string }>> {
  try {
    const { supabase, userId } = await getAuthenticatedSupabase()
    const resume = await getResumeById(supabase, resumeId, userId)

    if (!resume) {
      return actionError("Resume not found.")
    }

    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(resume.storage_path, 3600)

    if (error || !data?.signedUrl) {
      return actionError(error?.message ?? "Failed to create download URL.")
    }

    return actionSuccess({
      url: data.signedUrl,
      fileName: resume.file_name,
    })
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : "Failed to get download URL."
    )
  }
}
