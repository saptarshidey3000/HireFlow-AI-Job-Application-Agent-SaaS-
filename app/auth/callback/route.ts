import { createClient } from "@/lib/supabase/server"
import { getSiteUrl } from "@/lib/auth/url"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const cleanNext = next.startsWith("/") ? next : `/${next}`

  // Determine the correct base URL for redirection
  // In development, preserve the current request origin (e.g. http://localhost:3000)
  // In production / Vercel, read reverse proxy headers (x-forwarded-host) or site URL
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
  const isLocalEnv = process.env.NODE_ENV === "development"

  let redirectBase = origin
  if (!isLocalEnv && forwardedHost) {
    redirectBase = `${forwardedProto}://${forwardedHost}`
  } else if (!isLocalEnv && process.env.NEXT_PUBLIC_SITE_URL) {
    redirectBase = getSiteUrl()
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${redirectBase}${cleanNext}`)
    }
  }

  return NextResponse.redirect(`${redirectBase}/login?error=auth_callback_failed`)
}
