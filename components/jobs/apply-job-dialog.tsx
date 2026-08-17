"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Video,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getApplicationStatus,
  startJobApplication,
} from "@/lib/actions/applications"
import { getPlatformDisplayInfo, detectPlatformFromUrl } from "@/lib/browserbase/detector"
import type { JobRecord } from "@/lib/jobs/types"
import type { JobApplication } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

interface ApplyJobDialogProps {
  job: JobRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToast: (message: string) => void
  onAppliedSuccess?: (jobId: string) => void
}

export function ApplyJobDialog({
  job,
  open,
  onOpenChange,
  onToast,
  onAppliedSuccess,
}: ApplyJobDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentApp, setCurrentApp] = useState<JobApplication | null>(null)
  const [polling, setPolling] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCurrentApp(null)
      setPolling(false)
    }
    onOpenChange(nextOpen)
  }

  // Poll for status updates when in progress
  useEffect(() => {
    if (!polling || !currentApp?.id) return

    const interval = setInterval(async () => {
      const result = await getApplicationStatus(currentApp.id)
      if (result.success && result.data) {
        setCurrentApp(result.data)

        // Stop polling if reached terminal or user action state
        if (
          result.data.status === "APPLIED" ||
          result.data.status === "FAILED" ||
          result.data.status === "MISSING_INFO"
        ) {
          setPolling(false)

          if (result.data.status === "APPLIED") {
            onToast(`Successfully applied to ${job?.title || "job"}!`)
            if (job) onAppliedSuccess?.(job.id)
          }
        }
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [polling, currentApp?.id, job, onToast, onAppliedSuccess])

  if (!job) return null

  const platformMeta = detectPlatformFromUrl(job.job_url)
  const platformBadge = getPlatformDisplayInfo(platformMeta.platform)

  const handleManualApply = async () => {
    setLoading(true)
    // Open in new tab
    window.open(job.job_url, "_blank", "noopener,noreferrer")

    // Record application in DB
    const res = await startJobApplication({
      jobId: job.id,
      jobUrl: job.job_url,
      jobTitle: job.title,
      company: job.company,
      applyMode: "manual",
    })

    setLoading(false)
    if (res.success) {
      onToast("Opened job URL in new tab.")
      onAppliedSuccess?.(job.id)
      onOpenChange(false)
    }
  }

  const handleAutoApply = async () => {
    setLoading(true)
    const res = await startJobApplication({
      jobId: job.id,
      jobUrl: job.job_url,
      jobTitle: job.title,
      company: job.company,
      applyMode: "auto",
    })

    setLoading(false)
    if (!res.success) {
      onToast(res.error || "Failed to start AI application.")
      return
    }

    setCurrentApp(res.data)
    setPolling(true)
    onToast("AI Agent started! Detecting application form fields...")
  }

  const handleGoToProfile = () => {
    if (currentApp?.id) {
      onOpenChange(false)
      router.push(`/dashboard/profile?missing_for=${currentApp.id}`)
    }
  }

  const renderStatusSection = (app: JobApplication) => {
    const isDetecting = app.status === "PENDING" || app.status === "DETECTING_FIELDS"
    const isSubmitting = app.status === "READY_TO_SUBMIT" || app.status === "SUBMITTING"
    const isMissing = app.status === "MISSING_INFO"
    const isApplied = app.status === "APPLIED"
    const isFailed = app.status === "FAILED"

    return (
      <div className="space-y-4 rounded-xl border border-[#333333] bg-[#1a1a1a]/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDetecting && <Loader2 className="size-4 animate-spin text-[#3FA98A]" />}
            {isSubmitting && <Loader2 className="size-4 animate-spin text-[#60a5fa]" />}
            {isMissing && <AlertCircle className="size-4 text-[#fbbf24]" />}
            {isApplied && <CheckCircle2 className="size-4 text-[#3FA98A]" />}
            {isFailed && <AlertCircle className="size-4 text-[#f87171]" />}

            <span className="text-sm font-semibold text-white">
              {isDetecting && "Detecting Form Fields..."}
              {isSubmitting && "Submitting Application via AI..."}
              {isMissing && "Missing Required Profile Information"}
              {isApplied && "Application Submitted Successfully!"}
              {isFailed && "Application Failed"}
            </span>
          </div>

          {app.browserbase_session_id && (
            <a
              href={`https://www.browserbase.com/sessions/${app.browserbase_session_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#3FA98A] hover:underline"
            >
              <Video className="size-3" />
              <span>View Session</span>
            </a>
          )}
        </div>

        {isDetecting && (
          <p className="text-xs text-[#A7A7A7]">
            The AI browser agent is opening a Browserbase session on {platformMeta.name} to detect all required form fields and questions.
          </p>
        )}

        {isSubmitting && (
          <p className="text-xs text-[#A7A7A7]">
            All fields verified! Filling form inputs, attaching your resume, and submitting to {platformMeta.name}...
          </p>
        )}

        {isMissing && (
          <div className="space-y-3">
            <p className="text-xs text-[#A7A7A7]">
              This application requires the following information that is currently missing from your profile:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {app.missing_fields?.map((field) => (
                <span
                  key={field.fieldKey}
                  className="rounded-md border border-[#fbbf24]/30 bg-[#fbbf24]/10 px-2 py-0.5 text-xs text-[#fbbf24]"
                >
                  {field.label}
                </span>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleGoToProfile}
              className="w-full bg-[#2B8A70] text-xs font-semibold text-white hover:bg-[#3FA98A]"
            >
              <span>Complete Missing Fields in Profile</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}

        {isApplied && (
          <div className="space-y-2">
            <p className="text-xs text-[#A7A7A7]">
              Your application has been successfully submitted to <span className="font-semibold text-white">{job.company || "the company"}</span>.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full border-[#333333] text-xs text-white"
            >
              Done
            </Button>
          </div>
        )}

        {isFailed && (
          <div className="space-y-2">
            <p className="text-xs text-[#f87171]">
              {app.error_message || "An unexpected error occurred during submission."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoApply}
              className="w-full border-[#333333] text-xs text-white hover:bg-[#2B8A70]/20"
            >
              <RotateCcw className="size-3.5" />
              <span>Retry AI Application</span>
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg border-[rgba(255,255,255,0.08)] bg-[#1e1e1e] p-6 text-white sm:rounded-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                platformBadge.badgeColor
              )}
            >
              {platformBadge.name}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white line-clamp-1">
            {job.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#A7A7A7]">
            {job.company ? `${job.company} · ` : ""}{job.location || "Remote"}
          </DialogDescription>
        </DialogHeader>

        {currentApp ? (
          renderStatusSection(currentApp)
        ) : (
          <div className="space-y-3.5 py-2">
            {/* Option 1: Apply Automatically using AI Agent */}
            <div
              onClick={!loading ? handleAutoApply : undefined}
              className="group relative flex cursor-pointer flex-col gap-2.5 rounded-xl border border-[#2B8A70]/40 bg-[rgba(13,59,46,0.3)] p-4 transition-all hover:border-[#3FA98A] hover:bg-[rgba(13,59,46,0.5)] hover:shadow-[0_0_20px_rgba(43,138,112,0.2)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#2B8A70] text-white">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Apply Automatically using AI Agent
                    </h4>
                    <span className="text-[11px] font-medium text-[#3FA98A]">
                      Recommended · Powered by Browserbase & Stagehand
                    </span>
                  </div>
                </div>
                <div className="flex size-7 items-center justify-center rounded-full bg-[#2B8A70]/20 text-[#3FA98A] group-hover:bg-[#2B8A70] group-hover:text-white transition-all">
                  <Play className="size-3.5 fill-current" />
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[#CFCFCF]">
                Our AI browser agent will open the application in a cloud browser session, detect all required form fields, auto-fill your saved profile details & active resume, and submit it for you.
              </p>
            </div>

            {/* Option 2: Apply Manually */}
            <div
              onClick={!loading ? handleManualApply : undefined}
              className="group relative flex cursor-pointer flex-col gap-2.5 rounded-xl border border-[#333333] bg-[#242424] p-4 transition-all hover:border-[#404040] hover:bg-[#282828]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#333333] text-[#A7A7A7]">
                    <Globe className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Apply Manually
                    </h4>
                    <span className="text-[11px] text-[#707070]">
                      Open job page in a new browser tab
                    </span>
                  </div>
                </div>
                <div className="flex size-7 items-center justify-center rounded-full bg-[#333333] text-[#A7A7A7] group-hover:bg-[#404040] group-hover:text-white transition-all">
                  <ExternalLink className="size-3.5" />
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[#A7A7A7]">
                Navigate directly to the job application URL in your own browser tab and fill out the details manually.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-[#707070] hover:text-white"
          >
            Cancel
          </Button>

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#3FA98A]">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Launching...</span>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
