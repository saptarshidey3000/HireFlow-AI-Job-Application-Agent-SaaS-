/**
 * Re-exports job page utilities. Full description extraction can extend here.
 */
export {
  enrichPublicationDates,
  extractPublicationDateFromHtml,
  fetchJobPagePublicationDate,
} from "@/lib/jobs/job-page-extract"

export async function extractJobDescription(_url: string): Promise<string | null> {
  return null
}

export function isSnippetOnlyMatch(): true {
  return true
}
