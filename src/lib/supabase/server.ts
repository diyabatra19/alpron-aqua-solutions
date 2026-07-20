import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import {
  getServiceRoleKey,
  getSupabasePublicEnv,
  isSupabaseConfigured,
} from "@/lib/env";

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicEnv();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The proxy refreshes sessions.
        }
      },
    },
  });
}

export function createServiceRoleClient() {
  const { url } = getSupabasePublicEnv();
  return createClient<Database>(url, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
