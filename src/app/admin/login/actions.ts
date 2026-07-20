"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation";
import { strongPasswordSchema } from "@/lib/validation";
import { consumeRateLimit, getRequestIp } from "@/lib/security";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type LoginState = { message: string };

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { message: "Enter a valid administrator email and password." };
  if (!isSupabaseConfigured()) {
    return { message: "Authentication is not configured. Complete the Supabase setup first." };
  }

  const ip = await getRequestIp();
  const permitted = await consumeRateLimit(
    `login:${ip}:${parsed.data.email}`,
    5,
    15 * 60,
  );
  if (!permitted) return { message: "Too many attempts. Try again later." };

  const client = await createServerSupabaseClient();
  if (!client) return { message: "Authentication is unavailable." };
  const { data, error } = await client.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { message: "Email or password was not accepted." };

  const { data: profile } = await client
    .from("admin_profiles")
    .select("is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!profile?.is_active) {
    await client.auth.signOut();
    return { message: "This account is not authorized for administration." };
  }
  redirect("/admin");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (isSupabaseConfigured() && loginSchema.shape.email.safeParse(email).success) {
    const client = await createServerSupabaseClient();
    await client?.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/admin/reset-password`,
    });
  }
  redirect("/admin/login?reset=sent");
}

export async function completePasswordResetAction(formData: FormData) {
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  if (
    !strongPasswordSchema.safeParse(newPassword).success ||
    newPassword !== confirmPassword
  ) {
    redirect("/admin/reset-password?error=invalid");
  }
  const client = await createServerSupabaseClient();
  if (!client) redirect("/admin/login?setup=1");
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/admin/login?auth=expired");
  const { data: profile } = await client
    .from("admin_profiles")
    .select("is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.is_active) {
    await client.auth.signOut();
    redirect("/admin/login?auth=denied");
  }
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) redirect("/admin/reset-password?error=provider");
  await client.auth.signOut();
  redirect("/admin/login?password=changed");
}
