"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getApplicationStatus,
  resumeApplicationAfterProfileUpdate,
} from "@/lib/actions/applications"
import type { ProfileSectionId } from "@/lib/profile/completeness"
import type { JobApplication } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

export function MissingFieldsBanner({
  onSelectTab,
}: {
  onSelectTab: (tab: ProfileSectionId) => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get("missing_for")

  const [application, setApplication] = useState<JobApplication | null>(null)
  const [resuming, setResuming] = useState(false)
  const [resumed, setResumed] = useState(false)

  useEffect(() => {
    if (!applicationId) return

    let isMounted = true

    getApplicationStatus(applicationId).then((res) => {
      if (isMounted && res.success && res.data) {
        setApplication(res.data)
      }
    })

    return () => {
      isMounted = false
    }
  }, [applicationId])

  if (!applicationId || !application || application.status !== "MISSING_INFO") {
    return null
  }

  const handleResume = async () => {
    setResuming(true)
    const result = await resumeApplicationAfterProfileUpdate(application.id)
    setResuming(false)

    if (result.success) {
      setResumed(true)
      setTimeout(() => {
        router.push("/dashboard/application-status")
      }, 1500)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-[#fbbf24] bg-[#221c0e] p-5 shadow-[4px_4px_0px_0px_#000000] animate-in fade-in slide-in-from-top-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-[#fbbf24] bg-[#3a2e12] text-[#fbbf24] shadow-[2px_2px_0px_0px_#000000]">
            <AlertTriangle className="size-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
                Missing Profile Information
              </span>
              <span className="rounded-[4px] border border-[#384843] bg-[#141414] px-2 py-0.5 text-[11px] font-bold uppercase text-[#A7A7A7]">
                {application.company || "Job Application"}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white">
              Complete required fields to submit your application for &quot;{application.job_title}&quot;
            </h3>

            <p className="text-xs font-medium text-[#CFCFCF] max-w-2xl">
              The employer application form requires additional information before our AI Agent can finalize and submit your application.
            </p>

            {/* Missing Fields list */}
            {application.missing_fields && application.missing_fields.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-bold uppercase text-[#A7A7A7]">Required:</span>
                {application.missing_fields.map((field) => (
                  <button
                    key={field.fieldKey}
                    type="button"
                    onClick={() => {
                      if (field.section === "resume") {
                        router.push("/dashboard/resume")
                      } else {
                        onSelectTab(field.section)
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-[4px] border-2 border-[#fbbf24] bg-[#2d220c] px-2.5 py-1 text-xs font-bold text-[#fbbf24] shadow-[2px_2px_0px_0px_#000000] transition-all hover:bg-[#3d2e10] cursor-pointer"
                  >
                    <span>{field.label}</span>
                    <ArrowRight className="size-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 pt-2 sm:pt-0">
          <Button
            type="button"
            size="sm"
            disabled={resuming || resumed}
            onClick={handleResume}
            className={cn(
              "h-10 px-5 text-xs font-bold uppercase tracking-wider transition-all",
              resumed
                ? "border-2 border-[#145a46] bg-[#2B8A70] text-white"
                : "border-2 border-[#145a46] bg-[#2B8A70] text-white shadow-[3px_3px_0px_0px_#000000] hover:bg-[#3FA98A]"
            )}
          >
            {resuming ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Verifying & Resuming...</span>
              </>
            ) : resumed ? (
              <>
                <CheckCircle2 className="size-4" />
                <span>Resumed! Redirecting...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Resume AI Application</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
