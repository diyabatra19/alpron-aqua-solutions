import type { Metadata } from "next";
import {
  ArrowUpRight,
  Building2,
  Check,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { Reveal } from "@/components/reveal";
import { ButtonLink, PageIntro } from "@/components/ui";
import {
  businessFactsByKey,
  mailHref,
  phoneHref,
  safeGoogleMapsUrl,
  whatsappHref,
} from "@/lib/business";
import { getBusinessFacts, getProducts, getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact & Quotation Request",
  description:
    "Contact Alpron Aqua Solutions in Sahibabad or submit a product and quotation enquiry.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [facts, settings, catalogue] = await Promise.all([
    getBusinessFacts(),
    getSiteSettings(),
    getProducts({ pageSize: 48 }),
  ]);
  const byKey = businessFactsByKey(facts);
  const callHref = phoneHref(byKey.phone);
  const emailHref = mailHref(byKey.email);
  const chatHref = whatsappHref(
    byKey.whatsapp,
    "Hello Alpron Aqua Solutions, I would like to request a quotation.",
  );
  const mapEmbed = safeGoogleMapsUrl(byKey.map_embed_url);
  const directions = safeGoogleMapsUrl(byKey.directions_url);

  return (
    <>
      <PageIntro
        eyebrow="Contact & quotation"
        title="Share the product, quantity and delivery location."
        description={settings.contactIntro}
      />

      <section className="section-pad">
        <div className="container-shell grid gap-5 lg:grid-cols-3">
          <Reveal className="contact-info-tile">
            <MapPin className="size-6 text-[#00899b]" aria-hidden="true" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[#68808a]">Operating location</p>
            <p className="mt-3 text-base font-semibold leading-7 text-[#072f4c]">
              {byKey.address || "Address awaiting client verification"}
            </p>
            {directions ? (
              <a href={directions} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#007d91]">
                Open in Google Maps <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </Reveal>

          <Reveal delay={80} className="contact-info-tile">
            <Clock3 className="size-6 text-[#00899b]" aria-hidden="true" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[#68808a]">Business hours</p>
            <p className="mt-3 text-base font-semibold leading-7 text-[#072f4c]">
              {byKey.business_hours || "Hours awaiting client verification"}
            </p>
            {byKey.service_area ? (
              <p className="mt-4 text-sm leading-6 text-[#617681]">Listed service area: {byKey.service_area}</p>
            ) : null}
          </Reveal>

          <Reveal delay={160} className="contact-info-tile">
            <Building2 className="size-6 text-[#00899b]" aria-hidden="true" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[#68808a]">Business</p>
            <p className="mt-3 text-base font-semibold leading-7 text-[#072f4c]">
              Alpron Aqua Solutions
            </p>
            <p className="mt-2 text-sm leading-6 text-[#617681]">
              {byKey.business_type || "RO water-purification product enquiries"}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-[clamp(4rem,8vw,7rem)]">
        <div className="container-shell overflow-hidden rounded-[2rem] border border-[#cae2e7] bg-[#eaf7f8]">
          {mapEmbed ? (
            <iframe
              title="Alpron Aqua Solutions operating location map"
              src={mapEmbed}
              className="h-[360px] w-full border-0 sm:h-[460px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="grid min-h-[320px] place-items-center p-8 text-center">
              <div className="max-w-lg">
                <MapPin className="mx-auto size-8 text-[#00899b]" aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold text-[#072f4c]">Map location awaiting verification</h2>
                <p className="mt-3 text-sm leading-6 text-[#617681]">The map remains unpublished until an exact operating location is verified in administration.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="enquiry" className="section-pad section-ice scroll-mt-24">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <span className="eyebrow">Send an enquiry</span>
            <h2 className="section-title mt-5">Request confirmed product and supply details.</h2>
            <p className="body-large mt-5">
              The form stores your enquiry privately in the secure admin panel. No payment is collected online.
            </p>
            <div className="mt-8 grid gap-3">
              {callHref ? (
                <ButtonLink href={callHref} variant="secondary" className="justify-start">
                  <Phone className="size-4" aria-hidden="true" /> Call now
                </ButtonLink>
              ) : null}
              {chatHref ? (
                <ButtonLink href={chatHref} variant="quiet" className="justify-start">
                  <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp us
                </ButtonLink>
              ) : null}
              {emailHref ? (
                <ButtonLink href={emailHref} variant="secondary" className="justify-start">
                  <Mail className="size-4" aria-hidden="true" /> {byKey.email}
                </ButtonLink>
              ) : null}
            </div>
            {!callHref && !chatHref && !emailHref ? (
              <div className="mt-8 rounded-2xl border border-[#b9dfe3] bg-white/70 p-5 text-sm leading-6 text-[#07586a]">
                Direct phone, WhatsApp and email buttons remain hidden until the client verifies them. The enquiry form is fully available.
              </div>
            ) : null}
          </Reveal>
          <Reveal delay={100} className="surface-card p-6 sm:p-9">
            <InquiryForm
              sourcePage="/contact"
              products={catalogue.products.map((product) => ({
                id: product.id,
                name: product.name,
              }))}
            />
          </Reveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.68fr_1.32fr]">
          <Reveal>
            <span className="eyebrow">How to order</span>
            <h2 className="section-title mt-5">A quotation comes before an order.</h2>
            <p className="body-large mt-5">{settings.orderingIntro}</p>
          </Reveal>
          <ol className="grid gap-3 sm:grid-cols-2">
            {settings.orderingProcess.map((step, index) => (
              <Reveal key={`${index}-${step}`} delay={index * 60}>
                <li className="flex h-full gap-4 rounded-2xl border border-[#d4e5e9] bg-white p-5 shadow-[0_16px_45px_rgba(4,43,67,0.04)]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e4f9f9] text-xs font-bold text-[#007d91]">{index + 1}</span>
                  <span className="pt-1 text-sm font-semibold leading-6 text-[#334f5d]">{step}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="pb-[clamp(4rem,8vw,7rem)]">
        <div className="container-shell rounded-[2rem] bg-[#06314e] p-8 text-white sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Send className="size-6 text-[#65dbe2]" aria-hidden="true" />
              <h2 className="mt-6 text-3xl font-bold tracking-[-0.04em]">Include these details for a useful response.</h2>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/72">
                {["Product or category", "Required quantity", "Delivery city", "Intended requirement"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2"><Check className="size-4 text-[#65dbe2]" aria-hidden="true" /> {item}</span>
                ))}
              </div>
            </div>
            <ButtonLink href="#enquiry" variant="quiet">Complete the form</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
