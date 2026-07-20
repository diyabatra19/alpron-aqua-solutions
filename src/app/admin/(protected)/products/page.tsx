import Link from "next/link";
import { Archive, ExternalLink, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-shell";
import { StatusBadge } from "@/components/ui";
import { archiveProductAction, saveProductAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { documentToPlainText } from "@/lib/content";
import { getCategories, getMediaAssets, getProducts } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin(["super_admin", "content_editor"]);
  const params = await searchParams;
  const [result, categories, media] = await Promise.all([
    getProducts({ includeUnpublished: true, pageSize: 48 }),
    getCategories(true),
    getMediaAssets(),
  ]);
  const selected = typeof params.edit === "string" ? result.products.find((item) => item.id === params.edit) : undefined;
  const selectedSpecs = selected?.specifications.map((item) => `${item.key}: ${item.value}`).join("\n") || "";
  const selectedMedia = selected?.images.map((item) => item.mediaAssetId).join("\n") || "";
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Create, verify, publish, unpublish and archive product records."
        actions={<Link href="/admin/products?new=1#editor" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#072a47] px-5 text-sm font-semibold text-white"><Plus className="size-4" /> New product</Link>}
      />
      {params.saved ? <p className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Product saved and public caches refreshed.</p> : null}
      <div className="grid gap-4">
        {result.products.length ? result.products.map((product) => (
          <article key={product.id} className="surface-card flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-[#072a47]">{product.name}</h2>
                <StatusBadge tone={product.status === "published" ? "success" : product.status === "archived" ? "danger" : "warning"}>{product.status}</StatusBadge>
                <StatusBadge tone={product.verificationStatus === "verified" ? "success" : product.verificationStatus === "rejected" ? "danger" : "warning"}>{product.verificationStatus}</StatusBadge>
                {product.featured ? <StatusBadge>Featured</StatusBadge> : null}
              </div>
              <p className="mt-2 text-sm text-[#5b6e7a]">{product.categoryName} · {product.sku || "No SKU"}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.status === "published" ? <Link href={`/products/${product.slug}`} target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-[#007d91]">View <ExternalLink className="size-4" /></Link> : null}
              <Link href={`/admin/products?edit=${product.id}#editor`} className="text-sm font-semibold text-[#072a47]">Edit</Link>
              {product.status !== "archived" ? (
                <form action={archiveProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700"><Archive className="size-4" /> Archive</button>
                </form>
              ) : null}
            </div>
          </article>
        )) : <div className="surface-card p-8 text-sm text-[#5b6e7a]">No products have been created.</div>}
      </div>

      <section id="editor" className="surface-card mt-10 scroll-mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#072a47]">{selected ? `Edit ${selected.name}` : "Add a product"}</h2>
        <form action={saveProductAction} className="mt-7 grid gap-6">
          <input type="hidden" name="id" value={selected?.id || ""} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field"><label htmlFor="product-name">Product name *</label><input id="product-name" name="name" required maxLength={160} defaultValue={selected?.name} /></div>
            <div className="field"><label htmlFor="product-slug">URL slug</label><input id="product-slug" name="slug" maxLength={100} defaultValue={selected?.slug} /><span className="field-help">Generated from the name when blank.</span></div>
            <div className="field"><label htmlFor="product-sku">SKU / model</label><input id="product-sku" name="sku" maxLength={80} defaultValue={selected?.sku || ""} /></div>
            <div className="field"><label htmlFor="product-category">Category *</label><select id="product-category" name="categoryId" required defaultValue={selected?.categoryId}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          </div>
          <div className="field"><label htmlFor="product-short">Short description *</label><textarea id="product-short" name="shortDescription" required minLength={10} maxLength={500} rows={3} defaultValue={selected?.shortDescription} /></div>
          <div className="field"><label htmlFor="product-full">Full description</label><textarea id="product-full" name="fullDescription" maxLength={10000} rows={8} defaultValue={selected ? documentToPlainText(selected.fullDescription) : ""} /><span className="field-help">Paragraph breaks are preserved. Unsafe HTML is not accepted.</span></div>
          <div className="grid gap-5 md:grid-cols-4">
            <div className="field"><label htmlFor="product-price">Price (INR)</label><input id="product-price" name="priceRupees" type="number" min="0" step="0.01" defaultValue={selected?.pricePaise !== null && selected?.pricePaise !== undefined ? selected.pricePaise / 100 : ""} /></div>
            <div className="field"><label htmlFor="product-currency">Currency</label><input id="product-currency" name="currency" defaultValue={selected?.currency || "INR"} maxLength={3} /></div>
            <div className="field"><label htmlFor="product-moq">Minimum order</label><input id="product-moq" name="minimumOrderQuantity" type="number" min="0.001" step="0.001" defaultValue={selected?.minimumOrderQuantity || ""} /></div>
            <div className="field"><label htmlFor="product-unit">MOQ unit</label><input id="product-unit" name="minimumOrderUnit" maxLength={40} defaultValue={selected?.minimumOrderUnit || ""} placeholder="units" /></div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="field"><label htmlFor="product-availability">Availability</label><select id="product-availability" name="availability" defaultValue={selected?.availability || "contact_for_availability"}><option value="contact_for_availability">Contact for availability</option><option value="in_stock">In stock</option><option value="made_to_order">Made to order</option><option value="out_of_stock">Out of stock</option><option value="discontinued">Discontinued</option></select></div>
            <div className="field"><label htmlFor="product-status">Publication status</label><select id="product-status" name="status" defaultValue={selected?.status || "draft"}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
            <div className="field"><label htmlFor="product-order">Display order</label><input id="product-order" name="displayOrder" type="number" defaultValue={selected?.displayOrder || 0} /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#425563]"><input type="checkbox" name="showPrice" defaultChecked={selected?.showPrice} className="size-4 accent-[#007d91]" /> Show price publicly</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#425563]"><input type="checkbox" name="featured" defaultChecked={selected?.featured} className="size-4 accent-[#007d91]" /> Feature on homepage</label>
          </div>
          <div className="field"><label htmlFor="product-specs">Specifications</label><textarea id="product-specs" name="specifications" rows={7} defaultValue={selectedSpecs} placeholder={"Storage capacity: 10 L\nInstallation: Wall mounted"} /><span className="field-help">One “Key: Value” pair per line.</span></div>
          <div className="field"><label htmlFor="product-media">Media asset IDs in display order</label><textarea id="product-media" name="mediaIds" rows={4} defaultValue={selectedMedia} /><span className="field-help">Copy IDs from Media. First valid ID becomes the primary image. Available: {media.length}.</span></div>
          {media.length ? <div className="overflow-x-auto rounded-xl border border-[#d9e4e8] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#6b7e8a]">Media reference</p><div className="mt-3 grid gap-2 text-xs font-mono text-[#425563]">{media.slice(0, 20).map((asset) => <p key={asset.id}>{asset.id} — {asset.alt_text}</p>)}</div></div> : null}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field"><label htmlFor="product-source">Research source URL</label><input id="product-source" name="sourceUrl" type="url" defaultValue={selected?.sourceUrl || ""} /><span className="field-help">Admin-only provenance for this product record.</span></div>
            <div className="field"><label htmlFor="product-verification">Verification status</label><select id="product-verification" name="verificationStatus" defaultValue={selected?.verificationStatus || "unverified"}><option value="unverified">Unverified</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select><span className="field-help">Only a super administrator can verify a product. Public pages require both Published and Verified.</span></div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="field"><label htmlFor="product-seo-title">SEO title</label><input id="product-seo-title" name="seoTitle" maxLength={70} defaultValue={selected?.seoTitle || ""} /></div>
            <div className="field"><label htmlFor="product-canonical">Canonical override</label><input id="product-canonical" name="canonicalUrl" type="url" defaultValue={selected?.canonicalUrl || ""} /></div>
          </div>
          <div className="field"><label htmlFor="product-seo-description">SEO description</label><textarea id="product-seo-description" name="seoDescription" maxLength={170} rows={3} defaultValue={selected?.seoDescription || ""} /></div>
          <button className="justify-self-start rounded-full bg-[#072a47] px-6 py-3 text-sm font-semibold text-white">Save product</button>
        </form>
      </section>
    </>
  );
}
