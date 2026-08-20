"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { ProfileSection } from "@/components/profile/profile-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveLinks } from "@/lib/actions/profile"
import type { LinkType, ProfileLink } from "@/lib/supabase/database.types"

type LinkFormItem = {
  type: LinkType
  label: string
  url: string
}

function toFormItem(item: ProfileLink): LinkFormItem {
  return {
    type: item.type,
    label: item.label ?? "",
    url: item.url,
  }
}

function emptyItem(): LinkFormItem {
  return {
    type: "other",
    label: "",
    url: "",
  }
}

const linkTypes: LinkType[] = ["linkedin", "github", "portfolio", "other"]

export function LinksSection({
  links,
  embedded = false,
}: {
  links: ProfileLink[]
  embedded?: boolean
}) {
  const [items, setItems] = useState<LinkFormItem[]>(
    links.length > 0 ? links.map(toFormItem) : [emptyItem()]
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await saveLinks(items)
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
      title="Links"
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
            <div className="grid gap-3 md:grid-cols-[160px_1fr_1fr]">
              <select
                value={item.type}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index
                        ? { ...entry, type: e.target.value as LinkType }
                        : entry
                    )
                  )
                }
                className="h-10 rounded-md border border-transparent bg-[#242424] px-3 text-sm text-white outline-none focus:border-[#2B8A70]"
              >
                {linkTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <Input
                value={item.label}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index ? { ...entry, label: e.target.value } : entry
                    )
                  )
                }
                placeholder="Label"
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
                placeholder="https://"
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
