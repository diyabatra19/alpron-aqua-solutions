import { createHmac, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function getRequestIp() {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

export function hashRateLimitKey(value: string) {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET || "local-development-only";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.NODE_ENV !== "production";
  }
  const client = createServiceRoleClient();
  const { data, error } = await client.rpc("consume_rate_limit", {
    p_key_hash: hashRateLimitKey(key),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) return false;
  return data === true;
}

export async function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
