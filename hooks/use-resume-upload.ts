"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { parseResume, uploadResume, getResumeStatus } from "@/lib/actions/resume"
import type { ParsingStatus } from "@/lib/supabase/database.types"

type UploadPhase = ParsingStatus | "idle"

const PROCESSING_STATUSES: UploadPhase[] = [
  "uploading",
  "processing",
  "parsing",
  "saving_profile",
]

export function useResumeUpload(options?: { onComplete?: () => void }) {
  const router = useRouter()
  const [phase, setPhase] = useState<UploadPhase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const pollStatus = useCallback(
    (id: string) => {
      stopPolling()
      pollingRef.current = setInterval(async () => {
        const result = await getResumeStatus(id)
        if (!result.success) {
          setError(result.error)
          setPhase("error")
          stopPolling()
          return
        }

        const status = result.data.parsing_status
        setPhase(status)

        if (status === "complete") {
          stopPolling()
          options?.onComplete?.()
          router.refresh()
        }

        if (status === "error") {
          setError(result.data.parsing_error ?? "Parsing failed.")
          stopPolling()
        }
      }, 1500)
    },
    [options, router, stopPolling]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null)
      setPhase("uploading")

      const formData = new FormData()
      formData.append("file", file)

      const uploadResult = await uploadResume(formData)
      if (!uploadResult.success) {
        setError(uploadResult.error)
        setPhase("error")
        return
      }

      const id = uploadResult.data.resumeId
      setResumeId(id)
      setPhase("processing")
      pollStatus(id)

      const parseResult = await parseResume(id)
      if (!parseResult.success) {
        setError(parseResult.error)
        setPhase("error")
        stopPolling()
        return
      }

      setPhase("complete")
      stopPolling()
      options?.onComplete?.()
      router.refresh()
    },
    [options, pollStatus, router, stopPolling]
  )

  const reset = useCallback(() => {
    stopPolling()
    setPhase("idle")
    setError(null)
    setResumeId(null)
  }, [stopPolling])

  const isProcessing =
    phase !== "idle" &&
    phase !== "complete" &&
    phase !== "error" &&
    (PROCESSING_STATUSES.includes(phase) || phase === "processing")

  return {
    phase,
    error,
    resumeId,
    isProcessing,
    uploadFile,
    reset,
  }
}
