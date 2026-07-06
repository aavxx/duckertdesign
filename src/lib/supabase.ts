import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key — never import this in client
// components. Env vars come from the Vercel Supabase integration. The client
// is created lazily so `next build` works without env vars present.
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase env vars missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const real = getClient();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
