import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, PackageSearch } from "lucide-react";
import { CategoryVisual } from "@/components/category-visual";
import { ProductCard } from "@/components/product-card";
import { SolutionCategoryCard } from "@/components/solution-category-card";
import { ButtonLink } from "@/components/ui";
import { getCategories, getCategoryBySlug, getProducts, type Category } from "@/lib/data";

type CategoryParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: CategoryParams }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };
  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description,
    alternates: { canonical: `/products/category/${category.slug}` },
  };
}

function getAncestors(categories: Category[], category: Category) {
  const byId = new Map(categories.map((item) => [item.id, item]));
  const ancestors: Category[] = [];
  let current = category.parentId ? byId.get(category.parentId) : null;
  while (current && ancestors.length < 10) {
    ancestors.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return ancestors;
}

export default async function CategoryLandingPage({ params }: { params: CategoryParams }) {
  const { slug } = await params;
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ category: slug, pageSize: 12 }),
  ]);
  const category = categories.find((item) => item.slug === slug) || null;
  if (!category) notFound();
  const ancestors = getAncestors(categories, category);
  const children = categories
    .filter((item) => item.parentId === category.id)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <>
      <section className="border-b border-[#dce8eb] bg-white">
        <nav aria-label="Breadcrumb" className="container-shell flex min-h-12 flex-wrap items-center gap-2 text-xs text-[#617783]">
          <Link href="/">Home</Link><ChevronRight className="size-3" aria-hidden="true" />
          <Link href="/products">Products</Link>
          {ancestors.map((ancestor) => <span key={ancestor.id} className="contents"><ChevronRight className="size-3" aria-hidden="true" /><Link href={`/products/category/${ancestor.slug}`}>{ancestor.name}</Link></span>)}
          <ChevronRight className="size-3" aria-hidden="true" /><span aria-current="page">{category.name}</span>
        </nav>
      </section>

      <section className="category-landing-hero">
        <div className="container-shell grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-18">
          <div>
            <span className="eyebrow">Product category</span>
            <h1 className="section-title mt-5">{category.name}</h1>
            <p className="body-large mt-6 max-w-2xl">{category.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`/products?category=${category.slug}`}>Browse published products <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
              <ButtonLink href={`/contact?category=${category.slug}#enquiry`} variant="secondary">Request a quote</ButtonLink>
            </div>
          </div>
          <CategoryVisual category={category} priority className="aspect-[16/10] rounded-[2rem] border border-[#cfe2e6] shadow-[0_30px_80px_rgba(4,52,77,0.12)]" />
        </div>
      </section>

      {children.length ? (
        <section className="section-pad bg-white">
          <div className="container-shell">
            <div className="max-w-3xl"><span className="eyebrow">Browse within {category.name}</span><h2 className="section-title mt-5">Choose a more specific requirement.</h2></div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => <SolutionCategoryCard key={child.id} category={child} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-pad section-ice">
        <div className="container-shell">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><span className="eyebrow">Published products</span><h2 className="section-title mt-5">Available catalogue records.</h2></div>
            <Link href={`/products?category=${category.slug}`} className="text-sm font-bold text-[#007d91]">Open catalogue filter</Link>
          </div>
          {result.products.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          ) : (
            <div className="catalogue-empty-state mt-10">
              <PackageSearch className="size-8 text-[#057e94]" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-bold text-[#052e4b]">No verified products are published in this category yet.</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#5c727d]">The category is ready for product records without presenting invented models, prices or specifications.</p>
              <ButtonLink href={`/contact?category=${category.slug}#enquiry`} className="mt-6">Ask about {category.name}</ButtonLink>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
