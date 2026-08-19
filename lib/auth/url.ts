/**
 * Centralized utility to resolve the site base URL across all environments:
 * - Client-side: dynamically uses `window.location.origin`
 * - Server-side / Vercel: checks `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`,
 *   `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`, `NEXT_PUBLIC_VERCEL_URL`, `VERCEL_URL`,
 *   or falls back to `http://localhost:3000` for local development.
 */
export function getSiteUrl(): string {
  // 1. In the browser, always use the active origin (works for localhost, preview deployments, custom domains)
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin
  }

  // 2. Server-side environment variables (prioritizing custom domain, then Vercel system vars, then localhost)
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    "http://localhost:3000"

  // Ensure protocol is present
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`
  }

  // Strip trailing slash
  return url.replace(/\/$/, "")
}

/**
 * Returns the full URL for the OAuth authentication callback endpoint.
 */
export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`
}
