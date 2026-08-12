import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { DesktopNavigation, MobileNavigation } from "@/components/site-navigation";
import {
  businessFactsByKey,
  phoneHref,
  safeBrandAssetUrl,
} from "@/lib/business";
import {
  buildCategoryTree,
  type BusinessFact,
  type Category,
} from "@/lib/data";

const defaultPrimaryLogo = "/assets/brand/alpron-logo-horizontal-transparent.png";
const defaultCompactLogo = "/assets/brand/alpron-logo-mark-transparent.png";

export function BrandMark({
  facts = [],
  inverse = false,
  compactOnMobile = true,
}: {
  facts?: BusinessFact[];
  inverse?: boolean;
  compactOnMobile?: boolean;
}) {
  const byKey = businessFactsByKey(facts);
  const primaryLogo = safeBrandAssetUrl(byKey.primary_logo_url) || defaultPrimaryLogo;
  const compactLogo = safeBrandAssetUrl(byKey.compact_logo_url) || defaultCompactLogo;

  return (
    <Link
      href="/"
      className={`group inline-flex shrink-0 items-center rounded-2xl transition ${
        inverse
          ? "bg-white/95 px-3 py-2 shadow-[0_12px_35px_rgba(0,0,0,0.14)]"
          : "focus-visible:outline-offset-4"
      }`}
      aria-label="Alpron Aqua Solutions home"
    >
      <span className={`relative block transition-transform duration-300 group-hover:scale-[1.015] ${compactOnMobile ? "h-11 w-[50px] sm:h-[58px] sm:w-[198px]" : "h-[58px] w-[198px]"}`}>
        {compactOnMobile ? (
          <Image src={compactLogo} alt="Alpron Aqua Solutions logo" fill priority unoptimized sizes="50px" className="object-contain sm:hidden" />
        ) : null}
        <Image src={primaryLogo} alt="Alpron Aqua Solutions logo" fill priority unoptimized sizes="198px" className={compactOnMobile ? "hidden object-contain sm:block" : "block object-contain"} />
      </span>
    </Link>
  );
}

export function SiteHeader({ facts, categories }: { facts: BusinessFact[]; categories: Category[] }) {
  const byKey = businessFactsByKey(facts);
  const callHref = phoneHref(byKey.phone);
  const navigationCategories = buildCategoryTree(categories).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    children: category.children.map((child) => ({ id: child.id, name: child.name, slug: child.slug })),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-[#d8e7eb] bg-white/94 shadow-[0_8px_35px_rgba(6,40,63,0.05)] backdrop-blur-xl">
      <div className="site-utility hidden border-b border-[#e4f0f2] bg-[#f7fcfc] text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#587581] sm:block">
        <div className="container-shell flex min-h-8 items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#0aa4b4]" aria-hidden="true" /> Water treatment &amp; purification solutions</span>
          <span className="text-[#168294]">Catalogue enquiries · Quote-led ordering</span>
        </div>
      </div>
      <div className="container-shell flex min-h-[4.9rem] items-center justify-between gap-5">
        <BrandMark facts={facts} />
        <DesktopNavigation categories={navigationCategories} />
        <div className="ml-auto hidden items-center gap-2 sm:flex lg:ml-0">
          {callHref ? (
            <a href={callHref} className="grid size-11 place-items-center rounded-full border border-[#c9dfe4] text-[#006f80] transition hover:border-[#008fa3] hover:bg-[#e9fafa]" aria-label="Call Alpron Aqua Solutions">
              <Phone className="size-4" aria-hidden="true" />
            </a>
          ) : null}
          <ButtonLink href="/contact#enquiry">Request a quote <ArrowUpRight className="size-4" aria-hidden="true" /></ButtonLink>
        </div>
        <MobileNavigation categories={navigationCategories} />
      </div>
    </header>
  );
}
