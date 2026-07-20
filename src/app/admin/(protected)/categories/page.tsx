import Link from "next/link";
import { Plus } from "lucide-react";
import { saveCategoryAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin-shell";
import { StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin(["super_admin", "content_editor"]);
  const params = await searchParams;
  const categories = await getCategories(true);
  const selected = typeof params.edit === "string" ? categories.find((item) => item.id === params.edit) : undefined;
  return (
    <>
      <AdminPageHeader eyebrow="Catalogue" title="Categories" description="Manage the public product category structure." actions={<Link href="/admin/categories?new=1#editor" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#072a47] px-5 text-sm font-semibold text-white"><Plus className="size-4" /> New category</Link>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article key={category.id} className="surface-card p-5">
            <div className="flex items-start justify-between gap-4"><h2 className="font-bold text-[#072a47]">{category.name}</h2><StatusBadge tone={category.status === "published" ? "success" : "warning"}>{category.status}</StatusBadge></div>
            <p className="mt-3 text-sm leading-6 text-[#5b6e7a]">{category.description}</p>
            <Link href={`/admin/categories?edit=${category.id}#editor`} className="mt-5 inline-block text-sm font-semibold text-[#007d91]">Edit category</Link>
          </article>
        ))}
      </div>
      <section id="editor" className="surface-card mt-10 scroll-mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#072a47]">{selected ? `Edit ${selected.name}` : "Add a category"}</h2>
        <form action={saveCategoryAction} className="mt-7 grid gap-5">
          <input type="hidden" name="id" value={selected?.id || ""} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field"><label htmlFor="category-name">Name *</label><input id="category-name" name="name" required defaultValue={selected?.name} /></div>
            <div className="field"><label htmlFor="category-slug">URL slug</label><input id="category-slug" name="slug" defaultValue={selected?.slug} /></div>
          </div>
          <div className="field"><label htmlFor="category-description">Description</label><textarea id="category-description" name="description" rows={4} maxLength={500} defaultValue={selected?.description} /></div>
          <div className="field"><label htmlFor="category-alt">Placeholder / image alt text</label><input id="category-alt" name="imageAlt" maxLength={180} defaultValue={selected?.imageAlt} /></div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field"><label htmlFor="category-order">Display order</label><input id="category-order" name="displayOrder" type="number" defaultValue={selected?.displayOrder || 0} /></div>
            <div className="field"><label htmlFor="category-status">Status</label><select id="category-status" name="status" defaultValue={selected?.status || "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field"><label htmlFor="category-seo-title">SEO title</label><input id="category-seo-title" name="seoTitle" maxLength={70} defaultValue={selected?.seoTitle || ""} /></div>
            <div className="field"><label htmlFor="category-seo-description">SEO description</label><textarea id="category-seo-description" name="seoDescription" maxLength={170} rows={3} defaultValue={selected?.seoDescription || ""} /></div>
          </div>
          <button className="justify-self-start rounded-full bg-[#072a47] px-6 py-3 text-sm font-semibold text-white">Save category</button>
        </form>
      </section>
    </>
  );
}
