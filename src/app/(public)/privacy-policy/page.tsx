import type { Metadata } from "next";
import { RichContent } from "@/components/rich-content";
import { PageIntro } from "@/components/ui";
import { getPageBySlug } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPage() {
  const page = await getPageBySlug("privacy-policy");
  return (
    <>
      <PageIntro eyebrow="Legal information" title={page?.title || "Privacy Policy"} description="How website enquiry information is handled." />
      <section className="section-pad">
        <article className="container-shell max-w-3xl">
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Client review required before production launch. This text is an operational placeholder, not legal advice.
          </div>
          <RichContent value={page?.content} />
        </article>
      </section>
    </>
  );
}
