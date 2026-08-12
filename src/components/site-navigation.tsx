"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type NavigationCategory = {
  id: string;
  name: string;
  slug: string;
  children: Array<{ id: string; name: string; slug: string }>;
};

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function DesktopNavigation({ categories }: { categories: NavigationCategory[] }) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ pathname, open: false });
  const open = menuState.pathname === pathname && menuState.open;
  const setOpen = useCallback((nextOpen: boolean) => setMenuState({ pathname, open: nextOpen }), [pathname]);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <div ref={containerRef} className="hidden lg:block">
      <nav aria-label="Primary navigation" className="flex items-center gap-1">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className="nav-link relative rounded-full px-4 py-2.5 text-sm font-semibold text-[#334e5c]">Home</Link>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="products-mega-menu"
          className="nav-link relative inline-flex min-h-11 items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-[#334e5c]"
        >
          Products <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        {primaryLinks.slice(1).map((item) => (
          <Link key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined} className="nav-link relative rounded-full px-4 py-2.5 text-sm font-semibold text-[#334e5c]">{item.label}</Link>
        ))}
      </nav>

      {open ? (
        <div id="products-mega-menu" className="mega-menu-panel" aria-label="Product categories">
          <div className="grid gap-x-8 gap-y-7 p-7 lg:grid-cols-4">
            {categories.map((category) => (
              <section key={category.id} className={category.slug === "commercial-industrial-ro-systems" ? "lg:col-span-2" : ""}>
                <Link href={`/products/category/${category.slug}`} className="text-sm font-bold leading-5 text-[#052e4b] hover:text-[#007f97]">{category.name}</Link>
                <ul className={`mt-3 grid gap-2 ${category.slug === "commercial-industrial-ro-systems" ? "sm:grid-cols-2" : ""}`}>
                  {category.children.slice(0, category.slug === "commercial-industrial-ro-systems" ? 6 : 4).map((child) => (
                    <li key={child.id}><Link href={`/products/category/${child.slug}`} className="text-xs leading-5 text-[#617783] hover:text-[#007d91]">{child.name}</Link></li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#dfeaed] bg-[#f5fafb] px-7 py-4">
            <p className="text-xs text-[#6a7f89]">Browse by system, treatment type, component or service.</p>
            <Link href="/products" className="text-sm font-bold text-[#007d91]">View all products</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MobileNavigation({ categories }: { categories: NavigationCategory[] }) {
  const pathname = usePathname();
  const [drawerState, setDrawerState] = useState({ pathname, open: false });
  const open = drawerState.pathname === pathname && drawerState.open;
  const setOpen = useCallback((nextOpen: boolean) => setDrawerState({ pathname, open: nextOpen }), [pathname]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-navigation-drawer" className="grid size-11 place-items-center rounded-full border border-[#c9d8dd] text-[#072a47]">
        <span className="sr-only">Open navigation</span><Menu className="size-5" aria-hidden="true" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[90] bg-[#021522]/45 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <aside id="mobile-navigation-drawer" role="dialog" aria-modal="true" aria-label="Site navigation" className="ml-auto flex h-full w-[min(92vw,410px)] flex-col bg-white shadow-[-30px_0_80px_rgba(2,30,48,0.2)]">
            <div className="flex items-center justify-between border-b border-[#dfeaed] px-5 py-4">
              <p className="text-sm font-bold text-[#052e4b]">Browse Alpron</p>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full border border-[#d5e2e6] text-[#052e4b]" aria-label="Close navigation"><X className="size-5" aria-hidden="true" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">
              <nav aria-label="Mobile navigation" className="grid gap-1">
                <Link href="/" className="mobile-nav-link" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
                <div className="my-2 border-y border-[#e1eaed] py-2">
                  <p className="px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#68808a]">Products</p>
                  {categories.map((category, index) => (
                    <details key={category.id} className="mobile-category-group" open={index === 0}>
                      <summary>{category.name}<ChevronDown className="size-4 transition group-open:rotate-180" aria-hidden="true" /></summary>
                      <div className="grid border-l border-[#bcdde2] pl-3">
                        <Link href={`/products/category/${category.slug}`} className="mobile-subcategory-link font-bold text-[#087b91]">Explore all</Link>
                        {category.children.slice(0, 6).map((child) => <Link key={child.id} href={`/products/category/${child.slug}`} className="mobile-subcategory-link">{child.name}</Link>)}
                      </div>
                    </details>
                  ))}
                  <Link href="/products" className="mobile-nav-link mt-2 text-[#007d91]">View all products</Link>
                </div>
                {primaryLinks.slice(1).map((item) => <Link key={item.href} href={item.href} className="mobile-nav-link" aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>{item.label}</Link>)}
              </nav>
            </div>
            <div className="border-t border-[#dfeaed] p-4"><Link href="/contact#enquiry" className="flex min-h-12 items-center justify-center rounded-full bg-[#075f8f] px-5 text-sm font-bold text-white">Request a quote</Link></div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
