const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export function isSupabaseConfigured() {
  return Boolean(publicUrl && publishableKey);
}

export function getSupabasePublicEnv() {
  if (!publicUrl || !publishableKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return { url: publicUrl, publishableKey };
}

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return key;
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}
