import Link from "next/link";
import {
  Boxes,
  FileText,
  FolderTree,
  Gauge,
  ImageIcon,
  LogOut,
  MessageSquareText,
  Settings,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { BrandMark } from "@/components/site-header";
import type { AdminSession } from "@/lib/auth";
import { canManageContent, canManageSettings } from "@/lib/auth";

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  const navigation = [
    { href: "/admin", label: "Dashboard", icon: Gauge, show: true },
    { href: "/admin/products", label: "Products", icon: Boxes, show: canManageContent(session.role) },
    { href: "/admin/categories", label: "Categories", icon: FolderTree, show: canManageContent(session.role) },
    { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquareText, show: true },
    { href: "/admin/pages", label: "Pages", icon: FileText, show: canManageContent(session.role) },
    { href: "/admin/media", label: "Media", icon: ImageIcon, show: canManageContent(session.role) },
    { href: "/admin/settings", label: "Settings", icon: Settings, show: canManageSettings(session.role) },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-[#f3f7f8] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-[#d9e4e8] bg-white p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <BrandMark />
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 lg:grid">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#425563] hover:bg-[#edf5f7] hover:text-[#072a47]">
              <item.icon className="size-4" aria-hidden="true" /> {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-8 border-t border-[#e1eaed] pt-5 lg:absolute lg:bottom-5 lg:left-5 lg:right-5">
          <p className="truncate text-sm font-semibold text-[#072a47]">{session.displayName || session.email}</p>
          <p className="mt-1 text-xs capitalize text-[#6b7e8a]">{session.role.replaceAll("_", " ")}</p>
          <form action={logoutAction}>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#5b6e7a] hover:text-rose-700">
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#007d91]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#072a47]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6e7a]">{description}</p>
      </div>
      {actions}
    </header>
  );
}
