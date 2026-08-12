import Link from "next/link";
import { ArrowUpRight, Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandMark } from "@/components/site-header";
import {
  businessFactsByKey,
  mailHref,
  phoneHref,
  safePublicUrl,
  whatsappHref,
} from "@/lib/business";
import type { BusinessFact, Category } from "@/lib/data";

export function SiteFooter({ facts, categories }: { facts: BusinessFact[]; categories: Category[] }) {
  const byKey = businessFactsByKey(facts);
  const phoneLinks = [byKey.phone, byKey.phone_secondary, byKey.telephone]
    .map((value) => [value, phoneHref(value)] as const)
    .filter((item): item is [string, string] => Boolean(item[0] && item[1]));
  const emailHref = mailHref(byKey.email);
  const websiteHref = safePublicUrl(byKey.website);
  const chatHref = whatsappHref(byKey.whatsapp, "Hello Alpron Aqua Solutions, I would like to discuss a water-treatment requirement.");
  const productGroups = categories.filter((category) => !category.parentId && category.slug !== "installation-services").slice(0, 6);

  return (
    <footer className="relative overflow-hidden bg-[#031d31] text-white">
      <div className="footer-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container-shell relative grid gap-11 py-16 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.65fr_0.65fr_1.15fr] lg:py-20">
        <div>
          <BrandMark facts={facts} inverse compactOnMobile={false} />
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/68">
            Water purification and treatment categories for domestic, commercial and industrial requirements, supported by a direct quotation process.
          </p>
        </div>

        <div>
          <h2 className="footer-heading">Product groups</h2>
          <ul className="footer-link-list">
            {productGroups.map((category) => <li key={category.id}><Link href={`/products/category/${category.slug}`}>{category.name}</Link></li>)}
          </ul>
        </div>

        <div>
          <h2 className="footer-heading">Company</h2>
          <ul className="footer-link-list">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/products">All products</Link></li>
            <li><Link href="/products/category/installation-services">Services</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="footer-heading">Legal</h2>
          <ul className="footer-link-list">
            <li><Link href="/privacy-policy">Privacy policy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="footer-heading">Verified contact</h2>
          <ul className="mt-5 grid gap-4 text-sm text-white/72">
            {phoneLinks.map(([value, href]) => <li key={value} className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><a href={href}>{value}</a></li>)}
            {chatHref ? <li className="flex gap-3"><MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><a href={chatHref} target="_blank" rel="noreferrer">WhatsApp enquiry</a></li> : null}
            {emailHref ? <li className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><a href={emailHref}>{byKey.email}</a></li> : null}
            {byKey.address ? <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{byKey.address}</span></li> : null}
            {byKey.business_hours ? <li className="flex gap-3"><Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{byKey.business_hours}</span></li> : null}
            {websiteHref ? <li className="flex gap-3"><ArrowUpRight className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><a href={websiteHref} target="_blank" rel="noreferrer">Existing website</a></li> : null}
          </ul>
          {!facts.length ? <p className="mt-5 text-sm leading-6 text-white/60">Use the secure quotation form while public contact details await verification.</p> : null}
        </div>
      </div>
      <div className="relative border-t border-white/10 py-5">
        <div className="container-shell flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Alpron Aqua Solutions.</p>
          <p>Product details, availability and pricing are confirmed by quotation.</p>
        </div>
      </div>
    </footer>
  );
}
