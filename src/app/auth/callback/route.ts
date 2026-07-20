import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  if (code) {
    const client = await createServerSupabaseClient();
    const { error } = (await client?.auth.exchangeCodeForSession(code)) || { error: true };
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }
  return NextResponse.redirect(new URL("/admin/login?auth=failed", url.origin));
}
