import Image from "next/image";
import {
  ArrowRight,
  Beaker,
  Building2,
  Factory,
  Home,
  Hotel,
  PackageSearch,
  School,
  Settings2,
  ShieldCheck,
  Store,
  Waves,
  Wrench,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { SolutionCategoryCard } from "@/components/solution-category-card";
import { ButtonLink } from "@/components/ui";
import { getCategories, getProducts, getSiteSettings } from "@/lib/data";

const solutionCardSpans = [
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
];

const valueAreas = [
  { icon: Home, title: "Domestic purification", text: "Domestic RO formats, filtration combinations and related replacement-part categories." },
  { icon: Factory, title: "Commercial & industrial RO", text: "RO plant capacity groups, industrial equipment, accessories and customized plant enquiries." },
  { icon: Beaker, title: "Treatment chemicals", text: "RO, boiler, cooling-tower and general water-treatment chemical categories." },
  { icon: Settings2, title: "Equipment & components", text: "Filters, vessels, pumps, controls, measuring instruments and purifier spare parts." },
  { icon: Waves, title: "Water softening", text: "Domestic, commercial and industrial softener categories with related accessories." },
  { icon: Wrench, title: "Installation & maintenance", text: "Installation, repair, replacement, testing, commissioning and maintenance enquiries." },
];

const applicationSegments = [
  { icon: Home, label: "Homes" },
  { icon: Building2, label: "Commercial spaces" },
  { icon: School, label: "Schools" },
  { icon: Hotel, label: "Hotels" },
  { icon: Store, label: "Restaurants" },
  { icon: Factory, label: "Industrial facilities" },
];

export default async function HomePage() {
  const [settings, categories, featured] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getProducts({ featured: true, pageSize: 6 }),
  ]);
  const topLevelCategories = categories
    .filter((category) => !category.parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 7);

  return (
    <>
      <section className="catalogue-hero relative isolate overflow-hidden">
        <div className="container-shell relative grid min-h-[670px] items-center gap-12 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div className="max-w-3xl">
            <span className="eyebrow">Water Treatment &amp; Purification Solutions</span>
            <h1 className="display-title mt-7">{settings.heroTitle}</h1>
            <p className="body-large mt-7 max-w-2xl">{settings.heroDescription}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/products" className="shadow-[0_15px_35px_rgba(4,72,107,0.2)]">Explore products <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
              <ButtonLink href="/contact#enquiry" variant="secondary">Request a quote</ButtonLink>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#4b6572]">
              <span className="inline-flex items-center gap-2"><PackageSearch className="size-4 text-[#05869a]" aria-hidden="true" /> Structured product discovery</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-[#05869a]" aria-hidden="true" /> Verified products only</span>
            </div>
          </div>

          <div className="hero-catalogue-visual relative mx-auto w-full max-w-[560px]">
            <div className="hero-product-photo">
              <Image
                src="/assets/products/commercial-ro/commercial-ro-system-blue-housings.webp"
                alt="Commercial reverse-osmosis system with blue filter housings"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 44vw"
                className="object-contain p-8 sm:p-12"
              />
            </div>
            <div className="hero-range-card">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#087c91]">Catalogue range</p>
              <p className="mt-2 text-sm font-bold leading-5 text-[#052e4b]">Domestic systems · RO plants · chemicals · coolers · softeners</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-shell">
          <Reveal className="max-w-3xl">
            <span className="eyebrow">Explore our solutions</span>
            <h2 className="section-title mt-5">Start with the system, equipment or service you need.</h2>
            <p className="body-large mt-5">The catalogue is organised for faster discovery across domestic, commercial and industrial requirements.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
            {topLevelCategories.map((category, index) => (
              <Reveal key={category.id} delay={index * 55} className={solutionCardSpans[index]}>
                <SolutionCategoryCard category={category} className="h-full" priority={index < 2} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-ice">
        <div className="container-shell">
          <Reveal className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Featured products</span>
              <h2 className="section-title mt-5 max-w-3xl">Published catalogue products ready for enquiry.</h2>
            </div>
            <ButtonLink href="/products" variant="secondary">View catalogue</ButtonLink>
          </Reveal>
          {featured.products.length ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.products.map((product, index) => <Reveal key={product.id} delay={index * 60}><ProductCard product={product} /></Reveal>)}
            </div>
          ) : (
            <div className="catalogue-empty-state mt-10">
              <PackageSearch className="size-8 text-[#057e94]" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-bold text-[#052e4b]">Products are being updated.</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#5c727d]">Contact us for available solutions while verified product records are prepared for publication.</p>
              <ButtonLink href="/contact#enquiry" className="mt-6">Request availability</ButtonLink>
            </div>
          )}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <span className="eyebrow">Why Alpron</span>
            <h2 className="section-title mt-5">One clear route into a broad water-treatment catalogue.</h2>
            <p className="body-large mt-6">{settings.whyChooseIntro}</p>
            <ButtonLink href="/about" variant="secondary" className="mt-8">About Alpron Aqua Solutions</ButtonLink>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {valueAreas.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 45}>
                <div className="value-area-card h-full">
                  <Icon className="size-5 text-[#05869a]" aria-hidden="true" />
                  <h3 className="mt-6 text-lg font-bold text-[#052e4b]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5b717d]">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad application-band">
        <div className="container-shell">
          <Reveal className="text-center">
            <span className="eyebrow !text-[#6edce4]">Solutions for</span>
            <h2 className="section-title mx-auto mt-5 max-w-3xl !text-white">Different water-treatment contexts, organised in one catalogue.</h2>
          </Reveal>
          <div className="mt-11 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {applicationSegments.map(({ icon: Icon, label }, index) => (
              <Reveal key={label} delay={index * 45}>
                <div className="application-segment-card">
                  <Icon className="size-6 text-[#6edce4]" aria-hidden="true" />
                  <p className="mt-5 text-sm font-bold text-white">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-shell">
          <Reveal className="enquiry-banner">
            <div>
              <span className="eyebrow">Requirement-led support</span>
              <h2 className="section-title mt-5 max-w-3xl">{settings.ctaTitle}</h2>
              <p className="body-large mt-5 max-w-2xl">{settings.ctaDescription}</p>
            </div>
            <ButtonLink href="/contact#enquiry" className="shrink-0">Request a quote <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
