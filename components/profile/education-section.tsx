"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { ProfileSection } from "@/components/profile/profile-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveEducation } from "@/lib/actions/profile"
import type { ProfileEducation } from "@/lib/supabase/database.types"

type EducationFormItem = {
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
}

function toFormItem(item: ProfileEducation): EducationFormItem {
  return {
    institution: item.institution,
    degree: item.degree ?? "",
    fieldOfStudy: item.field_of_study ?? "",
    startDate: item.start_date ?? "",
    endDate: item.end_date ?? "",
  }
}

function emptyItem(): EducationFormItem {
  return {
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
  }
}

export function EducationSection({
  education,
  embedded = false,
}: {
  education: ProfileEducation[]
  embedded?: boolean
}) {
  const [items, setItems] = useState<EducationFormItem[]>(
    education.length > 0 ? education.map(toFormItem) : [emptyItem()]
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await saveEducation(items)
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
      title="Education"
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
            className="rounded-md border-2 border-[#2d3835] bg-[#141414] p-4 shadow-[2px_2px_0px_0px_#000000]"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={item.institution}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index
                        ? { ...entry, institution: e.target.value }
                        : entry
                    )
                  )
                }
                placeholder="Institution"
              />
              <Input
                value={item.degree}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index ? { ...entry, degree: e.target.value } : entry
                    )
                  )
                }
                placeholder="Degree"
              />
              <Input
                value={item.fieldOfStudy}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index
                        ? { ...entry, fieldOfStudy: e.target.value }
                        : entry
                    )
                  )
                }
                placeholder="Field of study"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={item.startDate}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((entry, i) =>
                        i === index
                          ? { ...entry, startDate: e.target.value }
                          : entry
                      )
                    )
                  }
                  placeholder="Start"
                />
                <Input
                  value={item.endDate}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((entry, i) =>
                        i === index
                          ? { ...entry, endDate: e.target.value }
                          : entry
                      )
                    )
                  }
                  placeholder="End"
                />
              </div>
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
