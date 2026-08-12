"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { ProfileSection } from "@/components/profile/profile-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveCertifications } from "@/lib/actions/profile"
import type { ProfileCertification } from "@/lib/supabase/database.types"

type CertificationFormItem = {
  name: string
  issuer: string
  issuedDate: string
  url: string
}

function toFormItem(item: ProfileCertification): CertificationFormItem {
  return {
    name: item.name,
    issuer: item.issuer ?? "",
    issuedDate: item.issued_date ?? "",
    url: item.url ?? "",
  }
}

function emptyItem(): CertificationFormItem {
  return {
    name: "",
    issuer: "",
    issuedDate: "",
    url: "",
  }
}

export function CertificationsSection({
  certifications,
  embedded = false,
}: {
  certifications: ProfileCertification[]
  embedded?: boolean
}) {
  const [items, setItems] = useState<CertificationFormItem[]>(
    certifications.length > 0
      ? certifications.map(toFormItem)
      : [emptyItem()]
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await saveCertifications(items)
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
      title="Certifications"
      hideTitle={embedded}
      action={
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setItems((prev) => [...prev, emptyItem()])}
          >
            <Plus className="size-4" />
            Add
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-[#333333] bg-[#1C1C1C]/50 p-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={item.name}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index ? { ...entry, name: e.target.value } : entry
                    )
                  )
                }
                placeholder="Certification name"
              />
              <Input
                value={item.issuer}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index ? { ...entry, issuer: e.target.value } : entry
                    )
                  )
                }
                placeholder="Issuer"
              />
              <Input
                value={item.issuedDate}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index
                        ? { ...entry, issuedDate: e.target.value }
                        : entry
                    )
                  )
                }
                placeholder="Issue date"
              />
              <Input
                value={item.url}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index ? { ...entry, url: e.target.value } : entry
                    )
                  )
                }
                placeholder="Credential URL"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="text-[#E05A5A] hover:text-[#E05A5A]"
                onClick={() =>
                  setItems((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-[#E05A5A]">{error}</p> : null}
    </ProfileSection>
  )
}
