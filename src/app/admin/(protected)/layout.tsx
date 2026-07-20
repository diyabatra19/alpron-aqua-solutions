import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
