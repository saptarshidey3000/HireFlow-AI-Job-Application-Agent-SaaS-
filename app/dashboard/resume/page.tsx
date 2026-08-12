import { ResumeCard, ResumeEmptyState } from "@/components/resume/resume-card"
import { getActiveResume } from "@/lib/data/resume"
import { createClient } from "@/lib/supabase/server"

export default async function ResumePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub as string | undefined

  if (!userId) return null

  const resume = await getActiveResume(supabase, userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">Resume</h1>
        <p className="mt-2 text-sm text-[#A7A7A7]">
          View, download, or replace your uploaded resume.
        </p>
      </div>

      {resume ? (
        <ResumeCard resume={resume} />
      ) : (
        <div className="flex min-h-[420px] items-center justify-center">
          <ResumeEmptyState />
        </div>
      )}
    </div>
  )
}
