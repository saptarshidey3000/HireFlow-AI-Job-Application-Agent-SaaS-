export function formatRelativeUploadDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return "Uploaded today"
  if (diffDays === 1) return "Uploaded yesterday"
  if (diffDays < 7) return `Uploaded ${diffDays} days ago`

  return `Uploaded on ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`
}

export function formatDateRange(
  start: string | null,
  end: string | null,
  isCurrent?: boolean
): string {
  if (!start && !end) return "Dates not specified"
  if (isCurrent) return `${start ?? ""} — Present`.trim()
  if (start && end) return `${start} — ${end}`
  return start ?? end ?? ""
}
