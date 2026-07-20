import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { RichContent } from "@/components/rich-content";
import { ButtonLink, PageIntro } from "@/components/ui";
import { businessFactsByKey } from "@/lib/business";
import {
  getBusinessFacts,
  getCategories,
  getPageBySlug,
  getSiteSettings,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Alpron Aqua Solutions, its water-purification catalogue and quotation-led ordering process.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [page, settings, categories, facts] = await Promise.all([
    getPageBySlug("about"),
    getSiteSettings(),
    getCategories(),
    getBusinessFacts(),
  ]);
  const byKey = businessFactsByKey(facts);

  return (
    <>
      <PageIntro
        eyebrow="About Alpron Aqua Solutions"
        title="A focused catalogue for water-purification requirements."
        description={settings.aboutSummary}
      />

      <section className="section-pad">
        <div className="container-shell grid gap-14 lg:grid-cols-[1fr_0.78fr]">
          <Reveal>
            <span className="eyebrow">Company introduction</span>
            <h2 className="section-title mt-5">{page?.title || "About Alpron Aqua Solutions"}</h2>
            <div className="mt-7"><RichContent value={page?.content} /></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/products">View products <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
              <ButtonLink href="/contact#enquiry" variant="secondary">Request a quote</ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={100} className="about-fact-panel">
            <Building2 className="size-7 text-[#65dbe2]" aria-hidden="true" />
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.15em] text-[#73dce3]">Verified public profile</p>
            <dl className="mt-6 grid gap-5">
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-white/50">Public brand</dt>
                <dd className="mt-2 text-lg font-bold text-white">Alpron Aqua Solutions</dd>
              </div>
              {byKey.business_type ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-white/50">Business type</dt>
                  <dd className="mt-2 text-lg font-bold text-white">{byKey.business_type}</dd>
                </div>
              ) : null}
              {byKey.address ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-white/50">Corporate office</dt>
                  <dd className="mt-2 flex gap-3 text-sm leading-6 text-white/75"><MapPin className="mt-0.5 size-4 shrink-0 text-[#65dbe2]" aria-hidden="true" />{byKey.address}</dd>
                </div>
              ) : null}
              {byKey.business_capabilities ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-white/50">Water-treatment capabilities</dt>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-white/80">{byKey.business_capabilities}</dd>
                </div>
              ) : null}
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="section-pad section-ice">
        <div className="container-shell">
          <Reveal className="max-w-3xl">
            <span className="eyebrow">Product focus</span>
            <h2 className="section-title mt-5">A straightforward range, organised by requirement.</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal key={category.id} delay={index * 80}>
                <div className="category-card h-full">
                  <PackageSearch className="size-6 text-[#00899b]" aria-hidden="true" />
                  <h3 className="mt-10 text-xl font-bold text-[#072f4c]">{category.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5b717c]">{category.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <span className="eyebrow">Publication principles</span>
            <h2 className="section-title mt-5">Trust begins with accurate information.</h2>
            <p className="body-large mt-5">The website separates sourced product records from details that still need client documentation.</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, "Verified business facts", "Sensitive legal and contact data appears publicly only after verification."],
              [ClipboardCheck, "Source-backed products", "Each imported catalogue item records its research source and verification state."],
              [CheckCircle2, "Quotation confirmation", "Price, specification, availability, delivery and payment are confirmed before supply."],
              [PackageSearch, "Client-controlled catalogue", "Categories, products, content and publication status remain editable through administration."],
            ].map(([Icon, title, text], index) => {
              const ItemIcon = Icon as typeof ShieldCheck;
              return (
                <Reveal key={String(title)} delay={index * 60}>
                  <div className="feature-card h-full">
                    <ItemIcon className="size-5 text-[#00899b]" aria-hidden="true" />
                    <h3 className="mt-7 text-lg font-bold text-[#072f4c]">{String(title)}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#5a707b]">{String(text)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
