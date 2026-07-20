import Link from "next/link";
import { ArrowUpRight, Droplets, Menu, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { DesktopNavigation, MobileNavigation } from "@/components/site-navigation";
import { businessFactsByKey, phoneHref } from "@/lib/business";
import type { BusinessFact } from "@/lib/data";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="Alpron Aqua Solutions home">
      <span
        aria-hidden="true"
        className={`brand-mark grid size-11 place-items-center rounded-[1.05rem] border text-sm font-black ${
          inverse
            ? "border-white/25 bg-white/10 text-white group-hover:bg-white/15"
            : "border-[#aad5dc] bg-[#dff7f8] text-[#006b7d] group-hover:border-[#69cbd3] group-hover:bg-[#c9f2f3]"
        }`}
      >
        <Droplets className="size-5" aria-hidden="true" />
      </span>
      <span className="grid leading-none">
        <span className={`text-base font-bold tracking-[-0.02em] ${inverse ? "text-white" : "text-[#072a47]"}`}>
          ALPRON AQUA
        </span>
        <span className={`mt-1 text-[0.62rem] font-semibold tracking-[0.24em] ${inverse ? "text-white/65" : "text-[#50707d]"}`}>
          SOLUTIONS
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader({ facts }: { facts: BusinessFact[] }) {
  const byKey = businessFactsByKey(facts);
  const callHref = phoneHref(byKey.phone);
  return (
    <header className="sticky top-0 z-40 border-b border-[#d8e7eb] bg-white/88 shadow-[0_8px_35px_rgba(6,40,63,0.04)] backdrop-blur-xl">
      <div className="site-utility hidden border-b border-[#e4f0f2] bg-[#f7fcfc] text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#587581] sm:block">
        <div className="container-shell flex min-h-8 items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#0aa4b4]" aria-hidden="true" /> Delhi/NCR water-purification catalogue</span>
          <span className="text-[#168294]">Quote-led ordering · No online payment</span>
        </div>
      </div>
      <div className="container-shell flex min-h-[4.75rem] items-center justify-between gap-6">
        <BrandMark />
        <DesktopNavigation />
        <div className="hidden items-center gap-2 md:flex">
          {callHref ? (
            <a href={callHref} className="grid size-11 place-items-center rounded-full border border-[#c9dfe4] text-[#006f80] transition hover:border-[#008fa3] hover:bg-[#e9fafa]" aria-label="Call Alpron Aqua Solutions">
              <Phone className="size-4" aria-hidden="true" />
            </a>
          ) : null}
          <ButtonLink href="/contact#enquiry">
            Request a quote <ArrowUpRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
        <details className="relative md:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-[#c9d8dd] text-[#072a47]">
            <span className="sr-only">Open navigation</span>
            <Menu className="size-5" aria-hidden="true" />
          </summary>
          <div
            className="absolute right-0 top-14 w-72 overflow-hidden rounded-2xl border border-[#d9e4e8] bg-white shadow-xl"
          >
            <MobileNavigation />
            <ButtonLink href="/contact#enquiry" className="m-2 mt-0 w-[calc(100%_-_1rem)]">
              Request a quote
            </ButtonLink>
          </div>
        </details>
      </div>
    </header>
  );
}
