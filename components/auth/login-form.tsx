"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import {
  AuthDivider,
  AuthError,
  AuthSubmitButton,
  GoogleButton,
} from "@/components/auth/auth-shared"
import { AuthFooterLink } from "@/components/auth/auth-layout"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth_callback_failed"
      ? "Authentication failed. Please try again."
      : null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
        <p className="mt-2 text-sm text-[#A7A7A7]">
          Sign in to continue to your HireFlow workspace.
        </p>
      </div>

      <GoogleButton />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthError message={error} />

        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-medium text-[#A7A7A7]">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-medium text-[#A7A7A7]">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[#707070] transition-colors hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <AuthSubmitButton loading={loading}>Log In</AuthSubmitButton>
      </form>

      <AuthFooterLink
        text="Don't have an account?"
        linkText="Sign up"
        href="/signup"
      />
    </div>
  )
}
