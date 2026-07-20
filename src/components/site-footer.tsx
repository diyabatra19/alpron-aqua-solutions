import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { BrandMark } from "@/components/site-header";
import {
  businessFactsByKey,
  mailHref,
  phoneHref,
  safePublicUrl,
  whatsappHref,
} from "@/lib/business";
import type { BusinessFact } from "@/lib/data";

export function SiteFooter({ facts }: { facts: BusinessFact[] }) {
  const byKey = businessFactsByKey(facts);
  const callHref = phoneHref(byKey.phone);
  const emailHref = mailHref(byKey.email);
  const chatHref = whatsappHref(
    byKey.whatsapp,
    "Hello Alpron Aqua Solutions, I would like to discuss a product requirement.",
  );
  const socials = [
    ["Facebook", safePublicUrl(byKey.facebook_url)],
    ["Instagram", safePublicUrl(byKey.instagram_url)],
    ["YouTube", safePublicUrl(byKey.youtube_url)],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <footer className="relative overflow-hidden bg-[#031d31] text-white">
      <div className="footer-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container-shell relative grid gap-12 py-16 md:grid-cols-[1.25fr_0.65fr_1.1fr] lg:py-20">
        <div>
          <BrandMark inverse />
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/68">
            Manufacturer and supplier of RO water purifiers, purifier bodies
            and water filters. Product details are confirmed through a direct
            quotation.
          </p>
          {socials.length ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {socials.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white/75 hover:border-white/35 hover:text-white"
                >
                  {label} <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">Explore</h2>
          <ul className="mt-5 grid gap-3 text-sm text-white/68">
            <li><Link href="/products" className="hover:text-white">Products</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">Business information</h2>
          <ul className="mt-5 grid gap-4 text-sm text-white/72">
            {callHref ? (
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <a href={callHref}>{byKey.phone}</a>
              </li>
            ) : null}
            {chatHref ? (
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <a href={chatHref} target="_blank" rel="noreferrer">WhatsApp enquiry</a>
              </li>
            ) : null}
            {emailHref ? (
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <a href={emailHref}>{byKey.email}</a>
              </li>
            ) : null}
            {byKey.address ? (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{byKey.address}</span>
              </li>
            ) : null}
            {byKey.business_hours ? (
              <li className="flex gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{byKey.business_hours}</span>
              </li>
            ) : null}
          </ul>
          {!facts.length ? (
            <p className="mt-5 text-sm leading-6 text-white/60">
              Use the secure quotation form while public contact details await verification.
            </p>
          ) : null}
        </div>
      </div>
      <div className="relative border-t border-white/10 py-5">
        <div className="container-shell flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Alpron Aqua Solutions.</p>
          <p>No online payment is requested. Product details are confirmed by quotation.</p>
        </div>
      </div>
    </footer>
  );
}
