import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ButtonLink, PageIntro } from "@/components/ui";
import { buildCategoryTree, getCategories, getProducts, type CategoryNode } from "@/lib/data";
import type { AvailabilityStatus } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Water Treatment Product Catalogue",
  description: "Browse Alpron Aqua Solutions categories for domestic RO, commercial and industrial RO, water chemicals, water coolers, water softeners, spare parts and services.",
  alternates: { canonical: "/products" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function flatten(nodes: CategoryNode[], depth = 0): Array<{ category: CategoryNode; depth: number }> {
  return nodes.flatMap((category) => [{ category, depth }, ...flatten(category.children, depth + 1)]);
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  const category = typeof params.category === "string" ? params.category : "";
  const availability = typeof params.availability === "string" ? params.availability : "";
  const sort = typeof params.sort === "string" ? params.sort : "display";
  const page = typeof params.page === "string" ? Math.max(1, Number(params.page) || 1) : 1;
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ search, category, availability: availability as AvailabilityStatus | "", sort, page, pageSize: 12 }),
  ]);
  const tree = buildCategoryTree(categories);
  const flatCategories = flatten(tree);
  const selectedCategory = categories.find((item) => item.slug === category);
  const selectedTopLevel = selectedCategory
    ? categories.find((item) => !item.parentId && (item.id === selectedCategory.id || categories.some((child) => child.id === selectedCategory.parentId && child.parentId === item.id)))
    : null;
  const visibleChildren = selectedTopLevel?.id
    ? categories.filter((item) => item.parentId === selectedTopLevel.id)
    : [];
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));

  const filterHref = (slug: string) => {
    const query = new URLSearchParams();
    if (slug) query.set("category", slug);
    if (search) query.set("q", search);
    if (availability) query.set("availability", availability);
    if (sort && sort !== "display") query.set("sort", sort);
    return `/products${query.size ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageIntro eyebrow="Product catalogue" title="Find the right category for your requirement." description="Browse the catalogue hierarchy, then request confirmed product, specification, availability and price information." />
      <section className="border-b border-[#dce8eb] bg-white">
        <nav aria-label="Breadcrumb" className="container-shell flex min-h-12 flex-wrap items-center gap-2 text-xs text-[#617783]">
          <Link href="/">Home</Link><ChevronRight className="size-3" aria-hidden="true" /><Link href="/products">Products</Link>
          {selectedCategory ? <><ChevronRight className="size-3" aria-hidden="true" /><span aria-current="page">{selectedCategory.name}</span></> : null}
        </nav>
      </section>
      <section className="section-pad !pt-10">
        <div className="container-shell grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside aria-label="Product categories">
            <details className="catalogue-mobile-filter lg:hidden">
              <summary>Browse categories <ChevronRight className="size-4" aria-hidden="true" /></summary>
              <div className="mt-3 grid gap-1 border-t border-[#dfeaed] pt-3">
                <Link href={filterHref("")} className="catalogue-category-link">All products</Link>
                {tree.map((root) => <Link key={root.id} href={filterHref(root.slug)} className="catalogue-category-link">{root.name}</Link>)}
              </div>
            </details>

            <div className="catalogue-sidebar hidden lg:block">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#6a808a]">Catalogue groups</p>
              <nav className="mt-4 grid gap-1" aria-label="Catalogue category filters">
                <Link href={filterHref("")} aria-current={!category ? "page" : undefined} className="catalogue-category-link">All products</Link>
                {tree.map((root) => (
                  <div key={root.id}>
                    <Link href={filterHref(root.slug)} aria-current={category === root.slug ? "page" : undefined} className="catalogue-category-link">{root.name}</Link>
                    {(selectedTopLevel?.id === root.id || category === root.slug) && root.children.length ? (
                      <div className="ml-4 grid border-l border-[#c8e1e5] pl-2">
                        {root.children.map((child) => <Link key={child.id} href={filterHref(child.slug)} aria-current={category === child.slug ? "page" : undefined} className="catalogue-subcategory-link">{child.name}</Link>)}
                      </div>
                    ) : null}
                  </div>
                ))}
              </nav>
              <div className="mt-7 rounded-2xl bg-[#eaf8f9] p-5">
                <p className="text-sm font-bold text-[#052e4b]">Need help choosing?</p>
                <p className="mt-2 text-xs leading-5 text-[#5c737e]">Share the application, quantity and location for a requirement-led response.</p>
                <Link href="/contact#enquiry" className="mt-4 inline-flex text-xs font-bold text-[#007d91]">Request guidance</Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <form method="get" className="catalogue-filter-bar grid gap-4 md:grid-cols-[1.2fr_0.9fr_0.8fr_0.7fr_auto]">
              <div className="field">
                <label htmlFor="catalogue-search">Search</label>
                <div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[#6b7e8a]" aria-hidden="true" /><input id="catalogue-search" name="q" defaultValue={search} className="!pl-10" placeholder="Product name" /></div>
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" defaultValue={category}>
                  <option value="">All categories</option>
                  {flatCategories.map(({ category: item, depth }) => <option key={item.id} value={item.slug}>{`${"— ".repeat(depth)}${item.name}`}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="availability">Availability</label>
                <select id="availability" name="availability" defaultValue={availability}><option value="">Any status</option><option value="contact_for_availability">Contact for availability</option><option value="in_stock">In stock</option><option value="made_to_order">Made to order</option><option value="out_of_stock">Out of stock</option></select>
              </div>
              <div className="field">
                <label htmlFor="sort">Sort</label>
                <select id="sort" name="sort" defaultValue={sort}><option value="display">Recommended</option><option value="name">Name</option><option value="newest">Newest</option></select>
              </div>
              <button className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#075f8f] px-5 text-sm font-semibold text-white hover:bg-[#064e76]"><SlidersHorizontal className="size-4" aria-hidden="true" /> Apply</button>
            </form>

            {selectedCategory ? (
              <div className="mt-8 rounded-2xl border border-[#cfe3e7] bg-[#f2fbfb] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#087c91]">Selected category</p>
                <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div><h2 className="text-2xl font-bold tracking-[-0.03em] text-[#052e4b]">{selectedCategory.name}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b717d]">{selectedCategory.description}</p></div>
                  <Link href={`/products/category/${selectedCategory.slug}`} className="shrink-0 text-sm font-bold text-[#007d91]">View category overview</Link>
                </div>
                {visibleChildren.length ? <div className="mt-4 flex flex-wrap gap-2">{visibleChildren.slice(0, 8).map((child) => <Link key={child.id} href={filterHref(child.slug)} className="rounded-full border border-[#bcdde2] bg-white px-3 py-1.5 text-xs font-semibold text-[#335a68]">{child.name}</Link>)}</div> : null}
              </div>
            ) : null}

            <div className="mt-8 flex items-end justify-between gap-4">
              <p className="text-sm text-[#5b6e7a]"><strong className="text-[#072a47]">{result.count}</strong> published product{result.count === 1 ? "" : "s"}</p>
              {(search || category || availability) ? <Link href="/products" className="text-sm font-semibold text-[#007d91]">Clear filters</Link> : null}
            </div>

            {result.products.length ? (
              <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{result.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            ) : (
              <div className="catalogue-empty-state mt-7">
                <Search className="size-8 text-[#007d91]" aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold text-[#072a47]">No verified products are published here yet.</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#5b6e7a]">The category remains available for enquiry without inventing product records, prices or specifications.</p>
                <ButtonLink href="/contact#enquiry" className="mt-6">Ask about this category</ButtonLink>
              </div>
            )}

            {totalPages > 1 ? (
              <nav aria-label="Catalogue pages" className="mt-10 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
                  const next = new URLSearchParams();
                  if (search) next.set("q", search);
                  if (category) next.set("category", category);
                  if (availability) next.set("availability", availability);
                  if (sort) next.set("sort", sort);
                  next.set("page", String(pageNumber));
                  return <Link key={pageNumber} href={`/products?${next}`} aria-current={pageNumber === page ? "page" : undefined} className={`grid size-10 place-items-center rounded-full text-sm font-semibold ${pageNumber === page ? "bg-[#072a47] text-white" : "border border-[#c9d8dd] text-[#425563]"}`}>{pageNumber}</Link>;
                })}
              </nav>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
