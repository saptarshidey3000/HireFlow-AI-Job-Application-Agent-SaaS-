"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()

    if (sessionData.session) {
      router.push("/dashboard")
      router.refresh()
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-white">Check your email</h2>
        <p className="text-sm text-[#A7A7A7]">
          We sent a confirmation link to <span className="text-white">{email}</span>.
          Click the link to activate your account.
        </p>
        <AuthFooterLink text="Already confirmed?" linkText="Log in" href="/login" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white">Sign Up Account</h2>
        <p className="mt-2 text-sm text-[#A7A7A7]">
          Enter your personal data to create your account.
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
              autoComplete="new-password"
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
          <p className="text-xs text-[#707070]">
            Password must be at least 8 characters.
          </p>
        </div>

        <AuthSubmitButton loading={loading}>Sign Up</AuthSubmitButton>
      </form>

      <AuthFooterLink
        text="Already have an account?"
        linkText="Log in"
        href="/login"
      />
    </div>
  )
}
