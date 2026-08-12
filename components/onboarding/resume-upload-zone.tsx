"use client"

import { useCallback, useRef, useState } from "react"
import { CheckCircle2, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useResumeUpload } from "@/hooks/use-resume-upload"

function getStatusMessage(phase: string): { title: string; description: string } {
  switch (phase) {
    case "uploading":
      return {
        title: "Uploading your resume…",
        description: "Securely storing your file.",
      }
    case "processing":
      return {
        title: "Processing file…",
        description: "Preparing your resume for analysis.",
      }
    case "parsing":
      return {
        title: "Parsing resume…",
        description: "Extracting experience, skills, education and more.",
      }
    case "saving_profile":
      return {
        title: "Saving profile…",
        description: "Building your HireFlow profile from your resume.",
      }
    case "complete":
      return {
        title: "Resume uploaded successfully.",
        description:
          "We've built your initial profile from your resume. You can review and edit everything anytime.",
      }
    case "error":
      return {
        title: "Something went wrong.",
        description: "Please try uploading your resume again.",
      }
    default:
      return {
        title: "",
        description: "",
      }
  }
}

export function ResumeUploadZone({
  onComplete,
  compact = false,
}: {
  onComplete?: () => void
  compact?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const { phase, error, isProcessing, uploadFile, reset } = useResumeUpload({
    onComplete,
  })

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || isProcessing) return
      void uploadFile(file)
    },
    [isProcessing, uploadFile]
  )

  const status = getStatusMessage(phase)
  const showUpload = phase === "idle" || phase === "error"

  return (
    <div className={cn("w-full", compact ? "space-y-4" : "space-y-6")}>
      {showUpload ? (
        <>
          <div
            data-dragging={dragging}
            className="glass-upload-zone flex cursor-pointer flex-col items-center justify-center px-6 py-12 text-center"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              handleFile(e.dataTransfer.files[0])
            }}
          >
            <div className="ai-surface mb-4 flex size-12 items-center justify-center rounded-full">
              <Upload className="size-5 text-[#3FA98A]" />
            </div>
            <p className="text-sm font-medium text-white">
              Upload your resume
            </p>
            <p className="mt-1 text-xs text-[#707070]">
              PDF or DOCX supported
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <Button
            className="w-full bg-white text-black hover:bg-white/90"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
          >
            Upload Resume
          </Button>

          {phase === "error" && (
            <div className="space-y-3 text-center">
              <p className="text-sm text-[#E05A5A]">{error}</p>
              <Button variant="outline" onClick={reset}>
                Try again
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card px-6 py-8 text-center">
          {phase === "complete" ? (
            <CheckCircle2 className="mx-auto mb-4 size-10 text-[#3FA98A]" />
          ) : (
            <Loader2 className="mx-auto mb-4 size-10 animate-spin text-[#3FA98A]" />
          )}
          <p className="text-base font-medium text-white">{status.title}</p>
          <p className="mt-2 text-sm text-[#A7A7A7]">{status.description}</p>
          {phase === "complete" && (
            <p className="mt-3 text-xs text-[#3FA98A]">✓ Resume uploaded</p>
          )}
        </div>
      )}
    </div>
  )
}
