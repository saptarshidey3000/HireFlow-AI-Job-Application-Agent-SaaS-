"use client"

import { useRef, useState } from "react"
import { Download, Eye, FileText, RefreshCw } from "lucide-react"

import { ResumeUploadZone } from "@/components/onboarding/resume-upload-zone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getResumeDownloadUrl } from "@/lib/actions/resume"
import { formatRelativeUploadDate } from "@/lib/format/date"
import { formatFileSize, formatFileType } from "@/lib/format/file-size"
import type { Resume } from "@/lib/supabase/database.types"

function getStatusBadgeVariant(status: Resume["parsing_status"]) {
  if (status === "complete") return "default" as const
  if (status === "error") return "error" as const
  if (status === "idle") return "muted" as const
  return "processing" as const
}

function getStatusLabel(status: Resume["parsing_status"]) {
  switch (status) {
    case "complete":
      return "Parsed successfully"
    case "error":
      return "Parsing failed"
    case "uploading":
      return "Uploading"
    case "processing":
      return "Processing"
    case "parsing":
      return "Parsing resume"
    case "saving_profile":
      return "Saving profile"
    default:
      return "Pending"
  }
}

export function ResumeCard({ resume }: { resume: Resume }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [replacing, setReplacing] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (openInNewTab = false) => {
    setLoadingAction(openInNewTab ? "view" : "download")
    setError(null)

    const result = await getResumeDownloadUrl(resume.id)
    setLoadingAction(null)

    if (!result.success) {
      setError(result.error)
      return
    }

    if (openInNewTab) {
      window.open(result.data.url, "_blank", "noopener,noreferrer")
      return
    }

    const link = document.createElement("a")
    link.href = result.data.url
    link.download = result.data.fileName
    link.click()
  }

  if (replacing) {
    return (
      <div className="max-w-2xl rounded-lg border-2 border-[#2d3835] bg-[#181818] p-6 shadow-[4px_4px_0px_0px_#0d3b2e]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-tight text-white">Replace Resume</h2>
          <Button variant="ghost" size="sm" onClick={() => setReplacing(false)}>
            Cancel
          </Button>
        </div>
        <ResumeUploadZone
          compact
          onComplete={() => setReplacing(false)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl rounded-lg border-2 border-[#2d3835] bg-[#181818] p-6 shadow-[4px_4px_0px_0px_#0d3b2e]">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] shadow-[2px_2px_0px_0px_#000000]">
          <FileText className="size-5 text-[#3FA98A]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold tracking-tight text-white">
            {resume.file_name}
          </h2>
          <p className="mt-1 text-xs font-medium text-[#A7A7A7]">
            {formatFileType(resume.file_type)} · {formatFileSize(resume.file_size)} ·{" "}
            {formatRelativeUploadDate(resume.uploaded_at)}
          </p>
          <div className="mt-3">
            <Badge variant={getStatusBadgeVariant(resume.parsing_status)}>
              <span className="size-1.5 rounded-full bg-current" />
              {getStatusLabel(resume.parsing_status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => handleDownload(true)}
          disabled={loadingAction !== null}
        >
          <Eye className="size-4" />
          {loadingAction === "view" ? "Opening…" : "View"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDownload(false)}
          disabled={loadingAction !== null}
        >
          <Download className="size-4" />
          {loadingAction === "download" ? "Preparing…" : "Download"}
        </Button>
        <Button variant="outline" onClick={() => setReplacing(true)}>
          <RefreshCw className="size-4" />
          Replace
        </Button>
      </div>

      <input ref={inputRef} type="file" className="hidden" />

      {error ? <p className="mt-4 text-sm font-bold text-[#E05A5A]">{error}</p> : null}
    </div>
  )
}

export function ResumeEmptyState() {
  return (
    <div className="max-w-lg rounded-lg border-2 border-[#2d3835] bg-[#181818] px-8 py-12 text-center shadow-[4px_4px_0px_0px_#0d3b2e]">
      <h2 className="text-2xl font-bold uppercase tracking-tight text-white">Resume</h2>
      <p className="mt-2 text-xs font-medium leading-relaxed text-[#A7A7A7]">
        Upload your resume to get started with HireFlow.
      </p>
      <div className="mt-6">
        <ResumeUploadZone compact />
      </div>
    </div>
  )
}
