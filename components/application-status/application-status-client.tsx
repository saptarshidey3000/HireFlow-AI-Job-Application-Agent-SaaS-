"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
  RotateCcw,
  Video,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  resumeApplicationAfterProfileUpdate,
} from "@/lib/actions/applications"
import { getPlatformDisplayInfo } from "@/lib/browserbase/detector"
import type { ApplicationStatus, JobApplication } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

interface ApplicationStatusClientProps {
  initialApplications: JobApplication[]
}

function formatAppDate(dateString: string | null): string {
  if (!dateString) return "Recently"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusBadge(status: ApplicationStatus) {
  switch (status) {
    case "APPLIED":
      return {
        label: "Applied",
        color: "bg-[#2B8A70]/20 text-[#3FA98A] border-[#2B8A70]/40",
        icon: <CheckCircle2 className="size-3.5" />,
      }
    case "MISSING_INFO":
      return {
        label: "Missing Profile Info",
        color: "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/40",
        icon: <AlertTriangle className="size-3.5" />,
      }
    case "DETECTING_FIELDS":
      return {
        label: "Detecting Fields",
        color: "bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/40",
        icon: <Loader2 className="size-3.5 animate-spin" />,
      }
    case "SUBMITTING":
    case "READY_TO_SUBMIT":
      return {
        label: "Submitting",
        color: "bg-[#818cf8]/20 text-[#818cf8] border-[#818cf8]/40",
        icon: <Loader2 className="size-3.5 animate-spin" />,
      }
    case "PENDING":
      return {
        label: "Queued",
        color: "bg-[#a3a3a3]/20 text-[#a3a3a3] border-[#a3a3a3]/40",
        icon: <Clock3 className="size-3.5" />,
      }
    case "FAILED":
      return {
        label: "Failed",
        color: "bg-[#f87171]/20 text-[#f87171] border-[#f87171]/40",
        icon: <AlertCircle className="size-3.5" />,
      }
    default:
      return {
        label: status,
        color: "bg-[#333333] text-[#A7A7A7] border-[#444444]",
        icon: null,
      }
  }
}

export function ApplicationStatusClient({
  initialApplications,
}: ApplicationStatusClientProps) {
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    missing: applications.filter((a) => a.status === "MISSING_INFO").length,
    inProgress: applications.filter(
      (a) =>
        a.status === "PENDING" ||
        a.status === "DETECTING_FIELDS" ||
        a.status === "READY_TO_SUBMIT" ||
        a.status === "SUBMITTING"
    ).length,
    failed: applications.filter((a) => a.status === "FAILED").length,
  }

  const handleRefresh = () => {
    setRefreshing(true)
    router.refresh()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleRetry = async (applicationId: string) => {
    setRetryingId(applicationId)
    const result = await resumeApplicationAfterProfileUpdate(applicationId)
    setRetryingId(null)

    if (result.success && result.data) {
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? result.data : app))
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
            Application Status
          </h1>
          <p className="mt-1 text-xs font-medium text-[#A7A7A7]">
            Track your job applications, Browserbase AI agent sessions, and pending form requirements.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={handleRefresh}
          className="self-start sm:self-auto h-9 px-4 text-xs font-bold uppercase"
        >
          <RefreshCw
            className={cn("size-3.5", refreshing && "animate-spin text-[#3FA98A]")}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-lg border-2 border-[#2d3835] bg-[#181818] p-4 shadow-[4px_4px_0px_0px_#0d3b2e]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A7A7A7]">Total Applications</span>
          <p className="mt-1 text-2xl font-extrabold text-white">{counts.total}</p>
        </div>

        <div className="rounded-lg border-2 border-[#2b8a70] bg-[#0d3b2e] p-4 shadow-[4px_4px_0px_0px_#000000]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3FA98A]">Applied</span>
          <p className="mt-1 text-2xl font-extrabold text-[#3FA98A]">{counts.applied}</p>
        </div>

        <div className="rounded-lg border-2 border-[#fbbf24] bg-[#221c0e] p-4 shadow-[4px_4px_0px_0px_#000000]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#fbbf24]">Missing Info</span>
          <p className="mt-1 text-2xl font-extrabold text-[#fbbf24]">{counts.missing}</p>
        </div>

        <div className="rounded-lg border-2 border-[#2d3835] bg-[#181818] p-4 shadow-[4px_4px_0px_0px_#0d3b2e]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A7A7A7]">In Progress</span>
          <p className="mt-1 text-2xl font-extrabold text-white">{counts.inProgress}</p>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="rounded-lg border-2 border-[#2d3835] bg-[#181818] p-12 text-center shadow-[4px_4px_0px_0px_#0d3b2e]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-md border-2 border-[#2b8a70] bg-[#0d3b2e] text-[#3FA98A] shadow-[2px_2px_0px_0px_#000000]">
            <Briefcase className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-bold uppercase text-white">
            No applications yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-[#A7A7A7]">
            Discover matching jobs and use our AI Agent to auto-apply in one click.
          </p>
          <div className="mt-5">
            <Link href="/dashboard/jobs">
              <Button size="sm" className="px-5 text-xs font-bold uppercase tracking-wider">
                <span>Discover Jobs</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {applications.map((app) => {
            const statusBadge = getStatusBadge(app.status)
            const platformBadge = getPlatformDisplayInfo(app.platform)
            const isMissing = app.status === "MISSING_INFO"
            const isFailed = app.status === "FAILED"
            const isAuto = app.apply_mode === "auto"

            return (
              <div
                key={app.id}
                className={cn(
                  "rounded-lg border-2 p-4.5 transition-all duration-120 sm:p-5",
                  isMissing
                    ? "border-[#fbbf24] bg-[#221c0e] shadow-[4px_4px_0px_0px_#000000]"
                    : "border-[#2d3835] bg-[#181818] shadow-[4px_4px_0px_0px_#0d3b2e]"
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase text-[#A7A7A7]">
                        {app.company || "Direct Employer"}
                      </span>
                      <span
                        className={cn(
                          "rounded-[4px] border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                          platformBadge.badgeColor
                        )}
                      >
                        {platformBadge.name}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#384843] bg-[#141414] px-2 py-0.5 text-[11px] font-bold uppercase text-[#A7A7A7]">
                        {isAuto ? (
                          <>
                            <Bot className="size-3 text-[#3FA98A]" />
                            <span>AI Agent</span>
                          </>
                        ) : (
                          <>
                            <Globe className="size-3 text-[#A7A7A7]" />
                            <span>Manual</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {app.job_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#707070]">
                      <span>Initiated: {formatAppDate(app.created_at)}</span>
                      {app.applied_at && (
                        <>
                          <span>·</span>
                          <span className="font-bold text-[#3FA98A]">Applied: {formatAppDate(app.applied_at)}</span>
                        </>
                      )}
                    </div>

                    {/* Missing fields alert tags */}
                    {isMissing && app.missing_fields && app.missing_fields.length > 0 && (
                      <div className="mt-2 rounded-md border-2 border-[#fbbf24] bg-[#2d220c] p-3 shadow-[2px_2px_0px_0px_#000000]">
                        <span className="text-xs font-bold uppercase text-[#fbbf24]">
                          Action required: Complete these profile fields to finish application:
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {app.missing_fields.map((field) => (
                            <span
                              key={field.fieldKey}
                              className="rounded-[4px] border border-[#fbbf24] bg-[#3a2e12] px-2 py-0.5 text-xs font-bold text-[#fbbf24]"
                            >
                              {field.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error message */}
                    {isFailed && app.error_message && (
                      <p className="text-xs font-bold text-[#f87171]">
                        Error: {app.error_message}
                      </p>
                    )}
                  </div>

                  {/* Right side actions & status */}
                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t-2 border-[#2d3835] sm:border-0">
                    {/* Status Badge */}
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-[4px] border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]",
                        statusBadge.color
                      )}
                    >
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </div>

                    {/* Browserbase Session Link */}
                    {app.browserbase_session_id && (
                      <a
                        href={`https://www.browserbase.com/sessions/${app.browserbase_session_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#3FA98A] hover:underline"
                      >
                        <Video className="size-3.5" />
                        <span>View Session Replay</span>
                      </a>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {isMissing ? (
                        <Link href={`/dashboard/profile?missing_for=${app.id}`}>
                          <Button
                            size="sm"
                            className="h-8.5 rounded-md border-2 border-[#fbbf24] bg-[#fbbf24] px-3.5 text-xs font-bold uppercase text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#f59e0b]"
                          >
                            <span>Fix in Profile</span>
                            <ArrowRight className="size-3" />
                          </Button>
                        </Link>
                      ) : isFailed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={retryingId === app.id}
                          onClick={() => handleRetry(app.id)}
                          className="h-8.5 text-xs font-bold uppercase"
                        >
                          {retryingId === app.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="size-3.5" />
                          )}
                          <span>Retry</span>
                        </Button>
                      ) : null}

                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8.5 items-center justify-center rounded-md border-2 border-[#384843] bg-[#141414] px-3 text-xs font-bold uppercase tracking-wider text-[#CFCFCF] shadow-[2px_2px_0px_0px_#000000] transition-all hover:border-[#3fa98a] hover:text-white"
                      >
                        <span>Job Link</span>
                        <ExternalLink className="ml-1 size-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
