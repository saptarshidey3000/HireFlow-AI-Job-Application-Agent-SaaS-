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
            <div className="mb-4 flex size-12 items-center justify-center rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] shadow-[2px_2px_0px_0px_#000000]">
              <Upload className="size-5 text-[#3FA98A]" />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-white">
              Upload your resume
            </p>
            <p className="mt-1 text-xs font-medium text-[#707070]">
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
            className="w-full font-bold uppercase tracking-wider"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
          >
            Upload Resume
          </Button>

          {phase === "error" && (
            <div className="space-y-3 text-center">
              <p className="text-sm font-bold text-[#E05A5A]">{error}</p>
              <Button variant="outline" onClick={reset}>
                Try again
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border-2 border-[#2d3835] bg-[#181818] px-6 py-8 text-center shadow-[4px_4px_0px_0px_#0d3b2e]">
          {phase === "complete" ? (
            <CheckCircle2 className="mx-auto mb-4 size-10 text-[#3FA98A]" />
          ) : (
            <Loader2 className="mx-auto mb-4 size-10 animate-spin text-[#3FA98A]" />
          )}
          <p className="text-base font-bold text-white">{status.title}</p>
          <p className="mt-2 text-xs font-medium text-[#A7A7A7]">{status.description}</p>
          {phase === "complete" && (
            <p className="mt-3 text-xs font-bold uppercase text-[#3FA98A]">✓ Resume uploaded</p>
          )}
        </div>
      )}
    </div>
  )
}
