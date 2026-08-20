"use client"

import { Loader2, Search, X } from "lucide-react"

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
    if (value.trim()) {
      onSearch()
    }
  }

  const handleClear = () => {
    onChange("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "glass-card p-4 md:p-5",
        "bg-[rgba(36,36,36,0.55)] border border-[rgba(255,255,255,0.06)]",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#707070]" />
          <Input
            id="target-role"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search jobs by title or role (e.g. Frontend Developer, Software Engineer)..."
            className="h-11 border-[#333333] bg-[rgba(13,59,46,0.18)] pl-10 pr-9 text-sm text-white placeholder:text-[#707070] focus:border-[#2B8A70] focus:ring-1 focus:ring-[#2B8A70]"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || !value.trim()}
          className="h-11 shrink-0 rounded-xl bg-[#2B8A70] px-6 font-medium text-white hover:bg-[#3FA98A] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          <span>Search Jobs</span>
        </Button>
      </div>
    </form>
  )
}
