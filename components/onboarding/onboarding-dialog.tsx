"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { ResumeUploadZone } from "@/components/onboarding/resume-upload-zone"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function OnboardingDialog({ open }: { open: boolean }) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  const handleComplete = () => {
    setTimeout(() => {
      setDismissed(true)
      router.refresh()
    }, 2000)
  }

  const isOpen = open && !dismissed

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return
      }}
      disablePointerDismissal
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-md border-[rgba(63,169,138,0.2)] shadow-[0_0_40px_rgba(43,138,112,0.15)]"
      >
        <DialogHeader>
          <DialogTitle>Welcome to HireFlow</DialogTitle>
          <DialogDescription>
            Let&apos;s build your profile.
            <br />
            Upload your resume to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-8">
          <ResumeUploadZone onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
