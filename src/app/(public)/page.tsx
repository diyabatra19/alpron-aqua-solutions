import Link from "next/link";
import {
  ArrowRight,
  Box,
  Check,
  ClipboardList,
  Clock3,
  Droplets,
  Filter,
  Layers3,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/ui";
import {
  businessFactsByKey,
  phoneHref,
  whatsappHref,
} from "@/lib/business";
import {
  getBusinessFacts,
  getCategories,
  getProducts,
  getSiteSettings,
} from "@/lib/data";

const categoryIcons = [Droplets, Box, Filter];
const applications = [
  {
    icon: Droplets,
    title: "RO purifier enquiries",
    text: "Browse seller-listed purifier options and request the current model, configuration and price.",
  },
  {
    icon: Box,
    title: "Purifier body requirements",
    text: "Discuss body design, compatibility, colour, quantity and supply requirements before ordering.",
  },
  {
    icon: Layers3,
    title: "Water filter requirements",
    text: "Share the intended application so filter type, dimensions, availability and price can be confirmed.",
  },
];

export default async function HomePage() {
  const [settings, categories, featured, facts] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getProducts({ featured: true, pageSize: 6 }),
    getBusinessFacts(),
  ]);
  const byKey = businessFactsByKey(facts);
  const callHref = phoneHref(byKey.phone);
  const chatHref = whatsappHref(
    byKey.whatsapp,
    "Hello Alpron Aqua Solutions, I would like to request a product quotation.",
  );

  return (
    <>
      <section className="hero-aqua relative isolate overflow-hidden">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="container-shell relative grid min-h-[720px] items-center gap-14 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="hero-copy">
            <span className="eyebrow">Water purification catalogue · Delhi/NCR</span>
            <h1 className="display-title mt-7 max-w-4xl">{settings.heroTitle}</h1>
            <p className="body-large mt-7 max-w-2xl">{settings.heroDescription}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" className="shadow-[0_14px_30px_rgba(5,65,91,0.2)]">
                View products <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/contact#enquiry" variant="secondary">
                Request a quote
              </ButtonLink>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#46616e]">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#008a9d]" aria-hidden="true" />
                Verified public information
              </span>
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="size-4 text-[#008a9d]" aria-hidden="true" />
                Quote-led ordering
              </span>
            </div>
          </div>

          <div className="hero-product-stage relative mx-auto w-full max-w-[560px]" aria-label="Water purification product range illustration">
            <div className="hero-stage-ring" aria-hidden="true" />
            <div className="hero-glass-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#047b8d]">Product range</p>
                  <p className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#062c48]">Purification, bodies & filters</p>
                </div>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#dff8f8] text-[#007d91]">
                  <Droplets className="size-5" aria-hidden="true" />
                </span>
              </div>
              <div className="purification-window mt-6">
                <span className="water-sheen absolute inset-0" aria-hidden="true" />
                <div className="purification-core">
                  <span className="core-line" />
                  <Droplets className="size-12 text-[#078b9e]" aria-hidden="true" />
                  <span className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#416b78]">Catalogue-led supply</span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {categories.slice(0, 3).map((category, index) => {
                  const Icon = categoryIcons[index] || PackageCheck;
                  return (
                    <Link key={category.id} href={`/products?category=${category.slug}`} className="hero-mini-card group">
                      <Icon className="size-4 text-[#00899b]" aria-hidden="true" />
                      <span>{category.name.replace("RO Water ", "RO ")}</span>
                    </Link>
                  );
                })}
              </div>
              <p className="mt-5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#6d818a]">
                Product photographs await client approval
              </p>
            </div>
          </div>
        </div>
        <div className="wave-divider" aria-hidden="true" />
      </section>

      <section className="section-pad">
        <div className="container-shell">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Product categories</span>
              <h2 className="section-title mt-5 max-w-2xl">Start with the requirement you need to source.</h2>
            </div>
            <ButtonLink href="/products" variant="secondary">View full catalogue</ButtonLink>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = categoryIcons[index] || PackageCheck;
              return (
                <Reveal key={category.id} delay={index * 90}>
                  <Link href={`/products?category=${category.slug}`} className="category-card group">
                    <div className="flex items-center justify-between">
                      <span className="grid size-14 place-items-center rounded-2xl bg-[#e2f9f9] text-[#007d91]">
                        <Icon className="size-6" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-xs text-[#6b8089]">0{index + 1}</span>
                    </div>
                    <h3 className="mt-12 text-2xl font-bold tracking-[-0.035em] text-[#062c48]">{category.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#566d78]">{category.description}</p>
                    <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#007d91]">
                      Browse products <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad section-ice">
        <div className="container-shell">
          <Reveal>
            <span className="eyebrow">Featured catalogue</span>
            <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <h2 className="section-title max-w-3xl">Seller-listed products ready for a confirmed quotation.</h2>
              <p className="max-w-sm text-sm leading-6 text-[#5d727c]">
                No unverified price, model or specification is presented as fact.
              </p>
            </div>
          </Reveal>
          {featured.products.length ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.products.map((product, index) => (
                <Reveal key={product.id} delay={index * 80}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="surface-card mt-10 p-8 text-center">
              Featured products will appear after the catalogue team publishes them.
            </div>
          )}
        </div>
      </section>

      <section className="section-pad overflow-hidden">
        <div className="container-shell grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <span className="eyebrow">About Alpron Aqua Solutions</span>
            <h2 className="section-title mt-5">{settings.aboutTitle}</h2>
            <p className="body-large mt-6">{settings.aboutSummary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/about">About the business</ButtonLink>
              <ButtonLink href="/contact#enquiry" variant="secondary">Send an enquiry</ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={100} className="about-water-panel">
            <div className="about-water-inner">
              <Sparkles className="size-7 text-[#54d5dd]" aria-hidden="true" />
              <p className="mt-10 text-xs font-bold uppercase tracking-[0.16em] text-[#73dce3]">Verified positioning</p>
              <p className="mt-4 max-w-md text-3xl font-bold tracking-[-0.04em] text-white">
                Manufacturer and supplier of focused water-purification categories.
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {categories.slice(0, 3).map((category) => (
                  <div key={category.id} className="rounded-2xl border border-white/13 bg-white/[0.07] p-4 text-sm font-semibold leading-5 text-white/82">
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad section-ice">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.76fr_1.24fr]">
          <Reveal>
            <span className="eyebrow">Why choose us</span>
            <h2 className="section-title mt-5">Clear information before commitment.</h2>
            <p className="body-large mt-6">{settings.whyChooseIntro}</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Verified-first catalogue", "Published products are tied to a recorded source and verification status."],
              ["No invented pricing", "When a verified price is unavailable, the website asks for a quotation."],
              ["Requirement-led response", "City, quantity, product and intended use reach the enquiry team together."],
              ["Editable business data", "Important public content remains controlled through the secure admin panel."],
            ].map(([title, text], index) => (
              <Reveal key={title} delay={index * 70}>
                <div className="feature-card">
                  <Check className="size-5 text-[#008b9e]" aria-hidden="true" />
                  <h3 className="mt-7 text-lg font-bold text-[#062c48]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5a707b]">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell">
          <Reveal className="text-center">
            <span className="eyebrow">Product applications</span>
            <h2 className="section-title mx-auto mt-5 max-w-3xl">Three clear routes into the catalogue.</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {applications.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 80}>
                <div className="application-card">
                  <Icon className="size-6 text-[#00899b]" aria-hidden="true" />
                  <h3 className="mt-8 text-xl font-bold text-[#062c48]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5a707b]">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad ordering-section">
        <div className="container-shell">
          <Reveal className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <span className="eyebrow !text-[#65dbe2]">How ordering works</span>
              <h2 className="section-title mt-5 !text-white">From catalogue to confirmed quotation.</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/70">{settings.orderingIntro}</p>
          </Reveal>
          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {settings.orderingProcess.map((step, index) => {
              const Icon = index === settings.orderingProcess.length - 1 ? Send : index < 2 ? PackageCheck : MessageCircle;
              return (
                <Reveal key={`${index}-${step}`} delay={index * 60}>
                  <div className="order-step">
                    <div className="flex items-center justify-between">
                      <Icon className="size-5 text-[#65dbe2]" aria-hidden="true" />
                      <span className="font-mono text-xs text-white/45">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="mt-8 text-sm font-semibold leading-6 text-white/88">{step}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <Reveal className="contact-summary-card">
            <span className="eyebrow">Business & contact</span>
            <h2 className="section-title mt-5 max-w-2xl">Visit the listed operating location or send an enquiry.</h2>
            <div className="mt-8 grid gap-4 text-sm text-[#445f6c]">
              {byKey.address ? (
                <p className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-[#00899b]" aria-hidden="true" /> {byKey.address}</p>
              ) : null}
              {byKey.business_hours ? (
                <p className="flex gap-3"><Clock3 className="mt-0.5 size-5 shrink-0 text-[#00899b]" aria-hidden="true" /> {byKey.business_hours}</p>
              ) : null}
            </div>
          </Reveal>
          <Reveal delay={100} className="surface-card grid content-center p-8 sm:p-10">
            <h3 className="text-2xl font-bold tracking-[-0.035em] text-[#062c48]">Choose how to start.</h3>
            <p className="mt-3 text-sm leading-6 text-[#5b727c]">Call and WhatsApp appear only when the direct client numbers are verified.</p>
            <div className="mt-7 grid gap-3">
              <ButtonLink href="/contact#enquiry">Send enquiry <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
              {callHref ? <ButtonLink href={callHref} variant="secondary"><Phone className="size-4" aria-hidden="true" /> Call now</ButtonLink> : null}
              {chatHref ? <ButtonLink href={chatHref} variant="quiet"><MessageCircle className="size-4" aria-hidden="true" /> WhatsApp us</ButtonLink> : null}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-[clamp(4rem,8vw,7rem)]">
        <Reveal className="container-shell">
          <div className="final-cta">
            <div>
              <span className="eyebrow">Request a quotation</span>
              <h2 className="section-title mt-5 max-w-3xl">{settings.ctaTitle}</h2>
              <p className="body-large mt-5 max-w-2xl">{settings.ctaDescription}</p>
            </div>
            <ButtonLink href="/contact#enquiry" className="mt-8 shrink-0 lg:mt-0">
              Start an enquiry <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
