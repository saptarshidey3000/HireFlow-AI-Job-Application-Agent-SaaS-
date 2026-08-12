"use client"

import { useState } from "react"

import { ProfileSection } from "@/components/profile/profile-section"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateProfessionalSummary } from "@/lib/actions/profile"

export function SummarySection({
  summary,
  embedded = false,
}: {
  summary: string | null
  embedded?: boolean
}) {
  const [value, setValue] = useState(summary ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await updateProfessionalSummary(value)
    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ProfileSection
      title="Professional Summary"
      hideTitle={embedded}
      action={
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </Button>
      }
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a brief professional summary…"
        className="min-h-[140px]"
      />
      {error ? <p className="mt-3 text-sm text-[#E05A5A]">{error}</p> : null}
    </ProfileSection>
  )
}
