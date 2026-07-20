import { cache } from "react";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
  role: AdminRole;
  displayName: string | null;
};

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const client = await createServerSupabaseClient();
  if (!client) return null;
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user?.email) return null;

  const { data: profile } = await client
    .from("admin_profiles")
    .select("role, display_name, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_active) return null;
  return {
    userId: user.id,
    email: user.email,
    role: profile.role,
    displayName: profile.display_name,
  };
});

export async function requireAdmin(roles?: AdminRole[]) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (roles && !roles.includes(session.role)) redirect("/admin?denied=1");
  return session;
}

export function canManageContent(role: AdminRole) {
  return role === "super_admin" || role === "content_editor";
}

export function canManageSettings(role: AdminRole) {
  return role === "super_admin";
}
