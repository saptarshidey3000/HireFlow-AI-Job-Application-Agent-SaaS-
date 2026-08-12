"use client"

import { useState } from "react"

import { ProfileSection } from "@/components/profile/profile-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updatePersonalInfo } from "@/lib/actions/profile"

export function PersonalInfoSection({
  fullName,
  email,
  phone,
  location,
  embedded = false,
}: {
  fullName: string | null
  email: string | null
  phone: string | null
  location: string | null
  embedded?: boolean
}) {
  const [form, setForm] = useState({
    fullName: fullName ?? "",
    phone: phone ?? "",
    location: location ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await updatePersonalInfo(form)
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
      title="Personal Information"
      hideTitle={embedded}
      action={
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-[#A7A7A7]">Name</label>
          <Input
            value={form.fullName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fullName: e.target.value }))
            }
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#A7A7A7]">Email</label>
          <Input value={email ?? ""} disabled placeholder="Email" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#A7A7A7]">Phone</label>
          <Input
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Phone number"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-[#A7A7A7]">Location</label>
          <Input
            value={form.location}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="City, Country"
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-[#E05A5A]">{error}</p> : null}
    </ProfileSection>
  )
}
