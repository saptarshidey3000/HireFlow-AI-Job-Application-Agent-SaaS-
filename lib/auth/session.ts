import { createClient } from "@/lib/supabase/server"

export async function getAuthenticatedSupabase() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) {
    throw new Error("Unauthorized")
  }

  return { supabase, userId: data.claims.sub as string }
}

export async function requireUserId(): Promise<string> {
  const { userId } = await getAuthenticatedSupabase()
  return userId
}
