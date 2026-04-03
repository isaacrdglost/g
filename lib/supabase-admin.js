import { createClient } from "@supabase/supabase-js";

// Client com service_role key - bypassa RLS
// Usar APENAS no admin panel
// A key precisa ter prefixo NEXT_PUBLIC_ pra funcionar em "use client"
export function createAdminClient() {
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
