import { createClient } from "@supabase/supabase-js";

// Public, anon-key client — safe for server components and client components alike.
// RLS on the database is what actually protects data, not secrecy of this key.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
