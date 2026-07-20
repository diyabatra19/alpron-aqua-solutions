import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { businessFactsByKey } from "@/lib/business";
import { getBusinessFacts, getSiteSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [facts, settings] = await Promise.all([getBusinessFacts(), getSiteSettings()]);
  const byKey = businessFactsByKey(facts);
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.brandName,
    url: getSiteUrl(),
    description: settings.defaultSeoDescription,
    address: byKey.address,
    telephone: byKey.phone,
    email: byKey.email,
    openingHours: byKey.business_hours,
    areaServed: byKey.service_area,
    hasMap: byKey.directions_url,
  };
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader facts={facts} />
      <main className="flex-1">{children}</main>
      <SiteFooter facts={facts} />
    </div>
  );
}
