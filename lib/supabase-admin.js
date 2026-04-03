import { createClient } from "@supabase/supabase-js";

// Client com service_role key - bypassa RLS
// Usar APENAS no admin panel (server-side ou client com cuidado)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
