"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function TargetRoleSearch({
  value,
  onChange,
  onSearch,
  loading,
  className,
}: {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  loading?: boolean
  className?: string
}) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("glass-card p-5 md:p-6", className)}
    >
      <label htmlFor="target-role" className="text-sm font-medium text-white">
        Target Role
      </label>
      <p className="mt-1 text-sm text-[#707070]">
        Search jobs matched to your resume for a specific role.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          id="target-role"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Frontend Developer"
          className="h-11 flex-1 border-[#333333] bg-[rgba(13,59,46,0.25)] text-white placeholder:text-[#707070]"
        />
        <Button
          type="submit"
          size="lg"
          disabled={loading || !value.trim()}
          className="h-11 shrink-0 px-6"
        >
          <Search className="size-4" />
          Search Jobs
        </Button>
      </div>
    </form>
  )
}
