import type { JobRecord, JobSortMode } from "@/lib/jobs/types"

function freshnessScore(publishedAt: string | null): number {
  if (!publishedAt) return 0

  const ageMs = Date.now() - new Date(publishedAt).getTime()
  if (Number.isNaN(ageMs) || ageMs < 0) return 0

  const ageHours = ageMs / 3_600_000

  if (ageHours <= 1 / 60) return 1
  if (ageHours <= 1) return 0.95
  if (ageHours <= 6) return 0.82
  if (ageHours <= 24) return 0.62
  if (ageHours <= 72) return 0.38
  if (ageHours <= 168) return 0.18
  return 0.06
}

function roleRelevanceScore(job: JobRecord, targetRole: string): number {
  const roleTokens = targetRole
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 2)
  if (roleTokens.length === 0) return 0.5

  const title = job.title.toLowerCase()
  const matches = roleTokens.filter((token) => title.includes(token)).length
  return matches / roleTokens.length
}

function combinedScore(job: JobRecord, targetRole: string): number {
  const freshness = freshnessScore(job.published_at)
  const match = job.match_score / 100
  const role = roleRelevanceScore(job, targetRole)
  return freshness * 0.5 + match * 0.35 + role * 0.15
}

function comparePublishedAt(a: JobRecord, b: JobRecord): number {
  const aTime = a.published_at ? new Date(a.published_at).getTime() : null
  const bTime = b.published_at ? new Date(b.published_at).getTime() : null

  if (aTime !== null && bTime !== null && aTime !== bTime) {
    return bTime - aTime
  }
  if (aTime !== null && bTime === null) return -1
  if (aTime === null && bTime !== null) return 1

  return new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime()
}

export function sortJobs(
  jobs: JobRecord[],
  sortMode: JobSortMode,
  targetRole: string
): JobRecord[] {
  const sorted = jobs.slice()

  switch (sortMode) {
    case "latest":
      return sorted.sort((a, b) => comparePublishedAt(a, b))

    case "best_match":
      return sorted.sort((a, b) => {
        if (b.match_score !== a.match_score) {
          return b.match_score - a.match_score
        }
        return comparePublishedAt(a, b)
      })

    case "latest_best_match":
      return sorted.sort((a, b) => {
        const scoreDiff = combinedScore(b, targetRole) - combinedScore(a, targetRole)
        if (Math.abs(scoreDiff) > 0.001) return scoreDiff > 0 ? 1 : -1
        return comparePublishedAt(a, b)
      })

    default:
      return sorted
  }
}

export { freshnessScore, roleRelevanceScore, combinedScore }
