import {
  changePasswordAction,
  saveBusinessFactAction,
  saveSettingsAction,
} from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin-shell";
import { StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getBusinessFacts, getSiteSettings } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminSettingsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin(["super_admin"]);
  const params = await searchParams;
  const [settings, facts] = await Promise.all([getSiteSettings(), getBusinessFacts(true)]);
  return (
    <>
      <AdminPageHeader eyebrow="Configuration" title="Settings" description="Control homepage copy, ordering guidance, SEO defaults, verified public facts and administrator password." />
      {params.password === "changed" ? <p className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Password updated securely.</p> : null}
      <div className="grid gap-8">
        <section className="surface-card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#072a47]">Site and SEO defaults</h2>
          <form action={saveSettingsAction} className="mt-7 grid gap-5">
            <div className="field"><label htmlFor="brand-name">Public brand name</label><input id="brand-name" name="brandName" required defaultValue={settings.brandName} /></div>
            <div className="field"><label htmlFor="hero-title">Homepage hero title</label><input id="hero-title" name="heroTitle" required maxLength={140} defaultValue={settings.heroTitle} /></div>
            <div className="field"><label htmlFor="hero-description">Homepage hero description</label><textarea id="hero-description" name="heroDescription" required maxLength={500} rows={4} defaultValue={settings.heroDescription} /></div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="field"><label htmlFor="about-title">Homepage About title</label><input id="about-title" name="aboutTitle" required maxLength={160} defaultValue={settings.aboutTitle} /></div>
              <div className="field"><label htmlFor="cta-title">Final enquiry CTA title</label><input id="cta-title" name="ctaTitle" required maxLength={160} defaultValue={settings.ctaTitle} /></div>
            </div>
            <div className="field"><label htmlFor="about-summary">Homepage About summary</label><textarea id="about-summary" name="aboutSummary" required maxLength={1500} rows={5} defaultValue={settings.aboutSummary} /></div>
            <div className="field"><label htmlFor="why-choose">Why choose us introduction</label><textarea id="why-choose" name="whyChooseIntro" required maxLength={1000} rows={4} defaultValue={settings.whyChooseIntro} /></div>
            <div className="field"><label htmlFor="ordering-intro">Ordering introduction</label><textarea id="ordering-intro" name="orderingIntro" required maxLength={1000} rows={4} defaultValue={settings.orderingIntro} /></div>
            <div className="field"><label htmlFor="ordering-process">Ordering steps</label><textarea id="ordering-process" name="orderingProcess" required maxLength={3000} rows={8} defaultValue={settings.orderingProcess.join("\n")} /><span className="field-help">One public step per line, in display order.</span></div>
            <div className="field"><label htmlFor="contact-intro">Contact-page introduction</label><textarea id="contact-intro" name="contactIntro" required maxLength={1000} rows={4} defaultValue={settings.contactIntro} /></div>
            <div className="field"><label htmlFor="cta-description">Final enquiry CTA description</label><textarea id="cta-description" name="ctaDescription" required maxLength={600} rows={4} defaultValue={settings.ctaDescription} /></div>
            <div className="field"><label htmlFor="default-seo-title">Default SEO title</label><input id="default-seo-title" name="defaultSeoTitle" required maxLength={70} defaultValue={settings.defaultSeoTitle} /></div>
            <div className="field"><label htmlFor="default-seo-description">Default SEO description</label><textarea id="default-seo-description" name="defaultSeoDescription" required minLength={30} maxLength={170} rows={3} defaultValue={settings.defaultSeoDescription} /></div>
            <button className="justify-self-start rounded-full bg-[#072a47] px-6 py-3 text-sm font-semibold text-white">Save settings</button>
          </form>
        </section>

        <section className="surface-card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#072a47]">Business fact verification</h2>
          <p className="mt-2 text-sm leading-6 text-[#5b6e7a]">A fact cannot be public until its status is verified. Source values are research notes, not proof.</p>
          <div className="mt-7 grid gap-5">
            {facts.map((fact) => (
              <form key={fact.id} action={saveBusinessFactAction} className="rounded-2xl border border-[#d9e4e8] p-5">
                <input type="hidden" name="id" value={fact.id} />
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div><h3 className="font-bold text-[#072a47]">{fact.label}</h3>{fact.sourceUrl ? <p className="mt-1 text-xs text-[#6b7e8a]">Research source recorded</p> : null}</div>
                  <StatusBadge tone={fact.verificationStatus === "verified" ? "success" : fact.verificationStatus === "rejected" ? "danger" : "warning"}>{fact.verificationStatus}</StatusBadge>
                </div>
                <div className="mt-5 field"><label htmlFor={`fact-${fact.id}`}>Value</label><textarea id={`fact-${fact.id}`} name="value" rows={2} maxLength={1000} defaultValue={fact.value || ""} /></div>
                <div className="mt-5 flex flex-wrap items-end gap-5">
                  <div className="field min-w-48"><label htmlFor={`verification-${fact.id}`}>Verification status</label><select id={`verification-${fact.id}`} name="verificationStatus" defaultValue={fact.verificationStatus}><option value="unverified">Unverified</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select></div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#425563]"><input type="checkbox" name="publicVisible" defaultChecked={fact.publicVisible} className="size-4 accent-[#007d91]" /> Show publicly</label>
                  <button className="mb-1 min-h-11 rounded-xl border border-[#c9d8dd] px-4 text-sm font-semibold text-[#072a47]">Save fact</button>
                </div>
              </form>
            ))}
          </div>
        </section>

        <section className="surface-card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#072a47]">Change administrator password</h2>
          <p className="mt-2 text-sm leading-6 text-[#5b6e7a]">The current password is re-authenticated before the provider accepts a change.</p>
          <form action={changePasswordAction} className="mt-7 grid max-w-xl gap-5">
            <div className="field"><label htmlFor="current-password">Current password</label><input id="current-password" name="currentPassword" type="password" required minLength={12} autoComplete="current-password" /></div>
            <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" name="newPassword" type="password" required minLength={12} autoComplete="new-password" /></div>
            <div className="field"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" name="confirmPassword" type="password" required minLength={12} autoComplete="new-password" /></div>
            <button className="justify-self-start rounded-full bg-[#072a47] px-6 py-3 text-sm font-semibold text-white">Update password</button>
          </form>
        </section>
      </div>
    </>
  );
}
