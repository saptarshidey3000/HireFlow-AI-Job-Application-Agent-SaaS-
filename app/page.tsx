import { LandingPage } from "@/components/landing/landing-page"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  return <LandingPage isAuthenticated={!!data?.claims} />
}
