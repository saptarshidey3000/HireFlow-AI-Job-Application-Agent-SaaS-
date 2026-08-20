"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { ProfileSection } from "@/components/profile/profile-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { saveProjects } from "@/lib/actions/profile"
import type { ProfileProject } from "@/lib/supabase/database.types"

type ProjectFormItem = {
  name: string
  description: string
  url: string
  technologies: string
}

function toFormItem(item: ProfileProject): ProjectFormItem {
  return {
    name: item.name,
    description: item.description ?? "",
    url: item.url ?? "",
    technologies: item.technologies.join(", "),
  }
}

function emptyItem(): ProjectFormItem {
  return {
    name: "",
    description: "",
    url: "",
    technologies: "",
  }
}

export function ProjectsSection({
  projects,
  embedded = false,
}: {
  projects: ProfileProject[]
  embedded?: boolean
}) {
  const [items, setItems] = useState<ProjectFormItem[]>(
    projects.length > 0 ? projects.map(toFormItem) : [emptyItem()]
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await saveProjects(
      items.map((item) => ({
        name: item.name,
        description: item.description,
        url: item.url,
        technologies: item.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }))
    )

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
      title="Projects"
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
            <div className="space-y-3">
              <Input
                value={item.name}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index ? { ...entry, name: e.target.value } : entry
                    )
                  )
                }
                placeholder="Project name"
              />
              <Textarea
                value={item.description}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index
                        ? { ...entry, description: e.target.value }
                        : entry
                    )
                  )
                }
                placeholder="Description"
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
                placeholder="Project URL"
              />
              <Input
                value={item.technologies}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index
                        ? { ...entry, technologies: e.target.value }
                        : entry
                    )
                  )
                }
                placeholder="Technologies (comma separated)"
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
