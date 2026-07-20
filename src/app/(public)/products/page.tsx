import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ButtonLink, PageIntro } from "@/components/ui";
import { getCategories, getProducts } from "@/lib/data";
import type { AvailabilityStatus } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Product Catalogue",
  description:
    "Search published RO water purifiers, purifier bodies and water filters from Alpron Aqua Solutions.",
  alternates: { canonical: "/products" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  const category = typeof params.category === "string" ? params.category : "";
  const availability =
    typeof params.availability === "string" ? params.availability : "";
  const sort = typeof params.sort === "string" ? params.sort : "display";
  const page = typeof params.page === "string" ? Math.max(1, Number(params.page) || 1) : 1;
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      search,
      category,
      availability: availability as AvailabilityStatus | "",
      sort,
      page,
      pageSize: 12,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <>
      <PageIntro
        eyebrow="Product catalogue"
        title="Find published products by category or requirement."
        description="Only verified and published product records appear here. Ask for a quotation when pricing is not displayed."
      />
      <section className="section-pad">
        <div className="container-shell">
          <form method="get" className="surface-card grid gap-4 p-5 lg:grid-cols-[1fr_0.7fr_0.7fr_0.6fr_auto]">
            <div className="field">
              <label htmlFor="catalogue-search">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[#6b7e8a]" aria-hidden="true" />
                <input id="catalogue-search" name="q" defaultValue={search} className="!pl-10" placeholder="Product name" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" defaultValue={category}>
                <option value="">All categories</option>
                {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="availability">Availability</label>
              <select id="availability" name="availability" defaultValue={availability}>
                <option value="">Any status</option>
                <option value="contact_for_availability">Contact for availability</option>
                <option value="in_stock">In stock</option>
                <option value="made_to_order">Made to order</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="sort">Sort</label>
              <select id="sort" name="sort" defaultValue={sort}>
                <option value="display">Recommended</option>
                <option value="name">Name</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <button className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#072a47] px-5 text-sm font-semibold text-white hover:bg-[#0b3a60]">
              <SlidersHorizontal className="size-4" aria-hidden="true" /> Apply
            </button>
          </form>

          <div className="mt-10 flex items-end justify-between gap-4">
            <p className="text-sm text-[#5b6e7a]">
              <strong className="text-[#072a47]">{result.count}</strong> published product{result.count === 1 ? "" : "s"}
            </p>
            {(search || category || availability) ? (
              <Link href="/products" className="text-sm font-semibold text-[#007d91]">Clear filters</Link>
            ) : null}
          </div>

          {result.products.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="surface-card mt-8 grid min-h-80 place-items-center p-8 text-center">
              <div className="max-w-lg">
                <Search className="mx-auto size-8 text-[#007d91]" aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold text-[#072a47]">No published products match yet</h2>
                <p className="mt-3 text-sm leading-6 text-[#5b6e7a]">
                  Product records remain private until their names, specifications and images are approved.
                </p>
                <ButtonLink href="/contact#enquiry" className="mt-6">Ask about this requirement</ButtonLink>
              </div>
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
                return (
                  <Link key={pageNumber} href={`/products?${next}`} aria-current={pageNumber === page ? "page" : undefined} className={`grid size-10 place-items-center rounded-full text-sm font-semibold ${pageNumber === page ? "bg-[#072a47] text-white" : "border border-[#c9d8dd] text-[#425563]"}`}>
                    {pageNumber}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}
