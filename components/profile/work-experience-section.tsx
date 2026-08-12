"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { ProfileSection } from "@/components/profile/profile-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { saveWorkExperiences } from "@/lib/actions/profile"
import { formatDateRange } from "@/lib/format/date"
import type { ProfileWorkExperience } from "@/lib/supabase/database.types"

type WorkFormItem = {
  company: string
  title: string
  startDate: string
  endDate: string
  isCurrent: boolean
  responsibilities: string
}

function toFormItem(item: ProfileWorkExperience): WorkFormItem {
  return {
    company: item.company,
    title: item.title,
    startDate: item.start_date ?? "",
    endDate: item.end_date ?? "",
    isCurrent: item.is_current,
    responsibilities: item.responsibilities.join("\n"),
  }
}

function emptyItem(): WorkFormItem {
  return {
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    responsibilities: "",
  }
}

export function WorkExperienceSection({
  workExperiences,
}: {
  workExperiences: ProfileWorkExperience[]
}) {
  const [items, setItems] = useState<WorkFormItem[]>(
    workExperiences.length > 0
      ? workExperiences.map(toFormItem)
      : [emptyItem()]
  )
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await saveWorkExperiences(
      items.map((item) => ({
        company: item.company,
        title: item.title,
        startDate: item.startDate,
        endDate: item.endDate,
        isCurrent: item.isCurrent,
        responsibilities: item.responsibilities
          .split("\n")
          .map((line) => line.replace(/^[•\-]\s*/, "").trim())
          .filter(Boolean),
      }))
    )

    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setEditingIndex(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ProfileSection
      title="Work Experience"
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
            {editingIndex === index ? (
              <div className="space-y-3">
                <Input
                  value={item.title}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((entry, i) =>
                        i === index
                          ? { ...entry, title: e.target.value }
                          : entry
                      )
                    )
                  }
                  placeholder="Job title"
                />
                <Input
                  value={item.company}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((entry, i) =>
                        i === index
                          ? { ...entry, company: e.target.value }
                          : entry
                      )
                    )
                  }
                  placeholder="Company name"
                />
                <div className="grid gap-3 md:grid-cols-2">
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
                    placeholder="Start date"
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
                    placeholder="End date"
                    disabled={item.isCurrent}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-[#A7A7A7]">
                  <input
                    type="checkbox"
                    checked={item.isCurrent}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((entry, i) =>
                          i === index
                            ? {
                                ...entry,
                                isCurrent: e.target.checked,
                                endDate: e.target.checked ? "" : entry.endDate,
                              }
                            : entry
                        )
                      )
                    }
                  />
                  Current role
                </label>
                <Textarea
                  value={item.responsibilities}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((entry, i) =>
                        i === index
                          ? { ...entry, responsibilities: e.target.value }
                          : entry
                      )
                    )
                  }
                  placeholder="One responsibility per line"
                />
              </div>
            ) : (
              <div>
                <p className="font-medium text-white">{item.title || "Untitled role"}</p>
                <p className="text-sm text-[#A7A7A7]">{item.company || "Company"}</p>
                <p className="mt-1 text-xs text-[#707070]">
                  {formatDateRange(
                    item.startDate,
                    item.endDate,
                    item.isCurrent
                  )}
                </p>
                {item.responsibilities ? (
                  <ul className="mt-3 space-y-1 text-sm text-[#A7A7A7]">
                    {item.responsibilities
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i}>• {line.replace(/^[•\-]\s*/, "")}</li>
                      ))}
                  </ul>
                ) : null}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setEditingIndex(editingIndex === index ? null : index)
                }
              >
                {editingIndex === index ? "Done" : "Edit"}
              </Button>
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
