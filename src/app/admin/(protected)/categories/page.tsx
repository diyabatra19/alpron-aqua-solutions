import Link from "next/link";
import { CornerDownRight, ImageIcon, Plus } from "lucide-react";
import { saveCategoryAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin-shell";
import { StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import {
  buildCategoryTree,
  getCategories,
  getCategoryDescendantIds,
  getMediaAssets,
  type CategoryNode,
} from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function flattenTree(nodes: CategoryNode[], depth = 0): Array<{ category: CategoryNode; depth: number }> {
  return nodes.flatMap((category) => [
    { category, depth },
    ...flattenTree(category.children, depth + 1),
  ]);
}

export default async function AdminCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin(["super_admin", "content_editor"]);
  const params = await searchParams;
  const [categories, media] = await Promise.all([
    getCategories(true),
    getMediaAssets(),
  ]);
  const selected = typeof params.edit === "string"
    ? categories.find((item) => item.id === params.edit)
    : undefined;
  const flatCategories = flattenTree(buildCategoryTree(categories));
  const blockedParentIds = selected
    ? new Set(getCategoryDescendantIds(categories, selected.id))
    : new Set<string>();

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Category hierarchy"
        description="Manage top-level groups, nested subcategories, visibility, order and category media. Existing product relationships are preserved."
        actions={(
          <Link href="/admin/categories?new=1#editor" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#072a47] px-5 text-sm font-semibold text-white">
            <Plus className="size-4" /> New category
          </Link>
        )}
      />
      {params.saved ? (
        <p className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
          Category saved and public catalogue pages refreshed.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[1.5rem] border border-[#d9e4e8] bg-white shadow-[0_18px_55px_rgba(4,31,53,0.06)]">
        {flatCategories.map(({ category, depth }, index) => (
          <article
            key={category.id}
            className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${index ? "border-t border-[#e4ecef]" : ""}`}
            style={{ paddingLeft: `${Math.min(depth, 3) * 1.25 + 1.25}rem` }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {depth ? <CornerDownRight className="size-4 shrink-0 text-[#69a8b4]" aria-hidden="true" /> : null}
                <h2 className="font-bold text-[#072a47]">{category.name}</h2>
                <StatusBadge tone={category.status === "published" ? "success" : "warning"}>{category.status}</StatusBadge>
                <StatusBadge tone={category.isActive ? "success" : "danger"}>{category.isActive ? "active" : "inactive"}</StatusBadge>
                {category.mediaAssetId ? <ImageIcon className="size-4 text-[#00899b]" aria-label="Category image assigned" /> : null}
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-[#6b7e8a]">/{category.slug}</p>
            </div>
            <Link href={`/admin/categories?edit=${category.id}#editor`} className="shrink-0 text-sm font-semibold text-[#007d91]">Edit</Link>
          </article>
        ))}
      </div>

      <section id="editor" className="surface-card mt-10 scroll-mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#072a47]">{selected ? `Edit ${selected.name}` : "Add a category"}</h2>
        <p className="mt-2 text-sm leading-6 text-[#5b6e7a]">
          Leave Parent category empty for a top-level catalogue group. Category media comes from the secure Media library.
        </p>
        <form action={saveCategoryAction} className="mt-7 grid gap-5">
          <input type="hidden" name="id" value={selected?.id || ""} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field"><label htmlFor="category-name">Name *</label><input id="category-name" name="name" required defaultValue={selected?.name} /></div>
            <div className="field"><label htmlFor="category-slug">URL slug</label><input id="category-slug" name="slug" defaultValue={selected?.slug} /></div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field">
              <label htmlFor="category-parent">Parent category</label>
              <select id="category-parent" name="parentId" defaultValue={selected?.parentId || ""}>
                <option value="">Top-level category</option>
                {flatCategories
                  .filter(({ category }) => !blockedParentIds.has(category.id))
                  .map(({ category, depth }) => (
                    <option key={category.id} value={category.id}>{`${"— ".repeat(depth)}${category.name}`}</option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="category-media">Category image</label>
              <select id="category-media" name="mediaAssetId" defaultValue={selected?.mediaAssetId || ""}>
                <option value="">Use intentional visual placeholder</option>
                {media.map((asset) => <option key={asset.id} value={asset.id}>{asset.alt_text}</option>)}
              </select>
              <span className="field-help">Upload replacement images in Media, then select one here.</span>
            </div>
          </div>
          <div className="field"><label htmlFor="category-description">Description</label><textarea id="category-description" name="description" rows={4} maxLength={500} defaultValue={selected?.description} /></div>
          <div className="field"><label htmlFor="category-alt">Image alt text</label><input id="category-alt" name="imageAlt" maxLength={180} defaultValue={selected?.imageAlt} /></div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field"><label htmlFor="category-order">Display order</label><input id="category-order" name="displayOrder" type="number" defaultValue={selected?.displayOrder || 0} /></div>
            <div className="field"><label htmlFor="category-status">Publication status</label><select id="category-status" name="status" defaultValue={selected?.status || "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-[#d9e4e8] bg-[#f7fbfc] p-4 text-sm font-semibold text-[#425563]">
            <input type="checkbox" name="isActive" defaultChecked={selected?.isActive ?? true} className="size-4 accent-[#007d91]" />
            Active in catalogue navigation
          </label>
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
