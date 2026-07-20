import { savePageAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin-shell";
import { StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { documentToPlainText } from "@/lib/content";
import { getAdminPages } from "@/lib/data";

export default async function AdminPagesPage() {
  await requireAdmin(["super_admin", "content_editor"]);
  const pages = await getAdminPages();
  return (
    <>
      <AdminPageHeader eyebrow="Website content" title="Pages" description="Edit structured page copy, publication state and page-level search metadata." />
      <div className="grid gap-6">
        {pages.map((page) => (
          <details key={page.id} className="surface-card overflow-hidden" open={page.slug === "about"}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6">
              <div><h2 className="font-bold text-[#072a47]">{page.title}</h2><p className="mt-1 font-mono text-xs text-[#6b7e8a]">/{page.slug === "home" ? "" : page.slug}</p></div>
              <StatusBadge tone={page.status === "published" ? "success" : "warning"}>{page.status}</StatusBadge>
            </summary>
            <form action={savePageAction} className="grid gap-5 border-t border-[#e1eaed] bg-[#fbfdfd] p-6">
              <input type="hidden" name="id" value={page.id} />
              <input type="hidden" name="slug" value={page.slug} />
              <div className="field"><label htmlFor={`title-${page.id}`}>Page title</label><input id={`title-${page.id}`} name="title" required maxLength={160} defaultValue={page.title} /></div>
              <div className="field"><label htmlFor={`body-${page.id}`}>Page content</label><textarea id={`body-${page.id}`} name="body" rows={10} maxLength={20000} defaultValue={documentToPlainText(page.content)} /><span className="field-help">Paragraphs are converted into safe structured content; arbitrary HTML is rejected.</span></div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="field"><label htmlFor={`status-${page.id}`}>Status</label><select id={`status-${page.id}`} name="status" defaultValue={page.status}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
                <div className="field"><label htmlFor={`canonical-${page.id}`}>Canonical override</label><input id={`canonical-${page.id}`} name="canonicalUrl" type="url" defaultValue={page.canonicalUrl || ""} /></div>
              </div>
              <div className="field"><label htmlFor={`seo-title-${page.id}`}>SEO title</label><input id={`seo-title-${page.id}`} name="seoTitle" maxLength={70} defaultValue={page.seoTitle || ""} /></div>
              <div className="field"><label htmlFor={`seo-description-${page.id}`}>SEO description</label><textarea id={`seo-description-${page.id}`} name="seoDescription" maxLength={170} rows={3} defaultValue={page.seoDescription || ""} /></div>
              <button className="justify-self-start rounded-full bg-[#072a47] px-6 py-3 text-sm font-semibold text-white">Save page</button>
            </form>
          </details>
        ))}
      </div>
    </>
  );
}
