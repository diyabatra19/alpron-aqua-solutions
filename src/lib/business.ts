import type { BusinessFact } from "@/lib/data";

export function businessFactsByKey(facts: BusinessFact[]) {
  return Object.fromEntries(
    facts
      .filter((fact) => fact.value)
      .map((fact) => [fact.key, fact.value as string]),
  );
}

export function phoneHref(value: string | undefined) {
  if (!value) return null;
  const normalized = value.replace(/[^\d+]/g, "");
  return /^\+?\d{7,15}$/.test(normalized) ? `tel:${normalized}` : null;
}

export function whatsappHref(value: string | undefined, message?: string) {
  if (!value) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (!/^\d{10,15}$/.test(digits)) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

export function mailHref(value: string | undefined) {
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return `mailto:${value}`;
}

export function safeGoogleMapsUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const allowedHosts = new Set([
      "www.google.com",
      "google.com",
      "maps.google.com",
      "maps.app.goo.gl",
    ]);
    return url.protocol === "https:" && allowedHosts.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function safePublicUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function safeBrandAssetUrl(value: string | undefined) {
  if (!value) return null;
  if (
    /^\/assets\/brand\/[a-z0-9][a-z0-9._-]*\.(?:avif|jpe?g|png|webp)$/i.test(
      value,
    )
  ) {
    return value;
  }
  try {
    const url = new URL(value);
    const isSupabaseAsset =
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/public/product-media/");
    return isSupabaseAsset ? url.toString() : null;
  } catch {
    return null;
  }
}
