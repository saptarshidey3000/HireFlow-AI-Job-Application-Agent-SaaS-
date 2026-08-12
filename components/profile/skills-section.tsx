"use client"

import { Plus, X } from "lucide-react"
import { useState } from "react"

import { ProfileSection } from "@/components/profile/profile-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveSkills } from "@/lib/actions/profile"
import type { ProfileSkill } from "@/lib/supabase/database.types"

export function SkillsSection({ skills }: { skills: ProfileSkill[] }) {
  const [items, setItems] = useState(skills.map((s) => s.name))
  const [newSkill, setNewSkill] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (!trimmed || items.includes(trimmed)) return
    setItems((prev) => [...prev, trimmed])
    setNewSkill("")
  }

  const removeSkill = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await saveSkills(items)
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
      title="Skills"
      action={
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {items.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#404040] bg-[#2D2D2D] px-3 py-1.5 text-sm text-white"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="text-[#707070] transition hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addSkill()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addSkill}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-[#E05A5A]">{error}</p> : null}
    </ProfileSection>
  )
}
