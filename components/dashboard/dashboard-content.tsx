"use client"

import { useRouter } from "next/navigation"
import { LogOut, Sparkles, Briefcase, FileText, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      className="h-9 rounded-md border-[#333333] bg-transparent text-[#A7A7A7] hover:border-[#404040] hover:bg-[#242424] hover:text-white"
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  )
}

const stats = [
  { label: "Applications", value: "0", icon: Briefcase },
  { label: "Resumes", value: "0", icon: FileText },
  { label: "Interviews", value: "0", icon: TrendingUp },
]

export function DashboardContent({
  email,
  fullName,
}: {
  email: string
  fullName?: string | null
}) {
  const displayName = fullName || email.split("@")[0]

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 flex-col border-r border-[#333333] bg-black p-6 md:flex">
        <div className="mb-8">
          <p className="text-lg font-semibold text-white">HireFlow</p>
          <p className="mt-1 text-xs text-[#707070]">AI Job Application Agent</p>
        </div>
        <nav className="space-y-1">
          <a
            href="/dashboard"
            className="flex items-center gap-3 rounded-md bg-[#0D3B2E] px-3 py-2 text-sm font-medium text-white"
          >
            <Sparkles className="size-4 text-[#3FA98A]" />
            Dashboard
          </a>
        </nav>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#333333] px-6 py-4 md:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#707070]">
              Welcome back
            </p>
            <h1 className="text-xl font-semibold text-white">{displayName}</h1>
          </div>
          <SignOutButton />
        </header>

        <div className="flex-1 p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">Your Dashboard</h2>
            <p className="mt-1 text-sm text-[#A7A7A7]">
              Track your job applications and AI-powered workflows.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-lg border border-[#333333] bg-[#242424] p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-[#A7A7A7]">{label}</span>
                  <Icon className="size-4 text-[#3FA98A]" />
                </div>
                <p className="text-3xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-[rgba(43,138,112,0.25)] bg-[rgba(13,59,46,0.25)] p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-[#3FA98A]" />
              <div>
                <p className="font-medium text-[#3FA98A]">AI is ready to help</p>
                <p className="mt-1 text-sm text-[#A7A7A7]">
                  Your HireFlow workspace is set up. Start by adding your first job
                  application or uploading a resume to get AI-powered insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
