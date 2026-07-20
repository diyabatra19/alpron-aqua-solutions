"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function DesktopNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
      {navigation.map((item) => {
        const current = isCurrent(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className="nav-link relative rounded-full px-4 py-2.5 text-sm font-semibold text-[#425563]"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mobile navigation" className="grid p-2">
      {navigation.map((item) => {
        const current = isCurrent(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-[#334b5a] aria-[current=page]:bg-[#e6f8f8] aria-[current=page]:text-[#006f80] hover:bg-[#edf5f7]"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
