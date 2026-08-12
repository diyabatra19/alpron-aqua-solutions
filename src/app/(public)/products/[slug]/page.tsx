import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle, Phone } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { RichContent } from "@/components/rich-content";
import { ButtonLink, StatusBadge } from "@/components/ui";
import { businessFactsByKey, phoneHref, whatsappHref } from "@/lib/business";
import { getBusinessFacts, getProductBySlug, getProducts } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";
import { formatPrice } from "@/lib/utils";

type ProductParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: ProductParams }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  const title = product.seoTitle || product.name;
  return {
    title: title.toLowerCase().includes("alpron aqua solutions")
      ? { absolute: title }
      : title,
    description: product.seoDescription || product.shortDescription,
    alternates: { canonical: product.canonicalUrl || `/products/${product.slug}` },
    openGraph: {
      title,
      description: product.seoDescription || product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0].url, alt: product.images[0].alt }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: ProductParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [related, facts] = await Promise.all([
    getProducts({ category: product.categorySlug, pageSize: 4 }),
    getBusinessFacts(),
  ]);
  const relatedProducts = related.products.filter((item) => item.id !== product.id).slice(0, 3);
  const byKey = businessFactsByKey(facts);
  const callHref = phoneHref(byKey.phone);
  const chatHref = whatsappHref(
    byKey.whatsapp,
    `Hello Alpron Aqua Solutions, I would like the latest price for ${product.name}.`,
  );
  const availabilityLabels = {
    contact_for_availability: "Contact for availability",
    in_stock: "In stock",
    made_to_order: "Made to order",
    out_of_stock: "Out of stock",
    discontinued: "Discontinued",
  };
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku || undefined,
    image: product.images.map((image) => image.url),
    category: product.categoryName,
    url: `${getSiteUrl()}/products/${product.slug}`,
    offers:
      product.showPrice && product.pricePaise !== null
        ? {
            "@type": "Offer",
            priceCurrency: product.currency,
            price: (product.pricePaise / 100).toFixed(2),
            url: `${getSiteUrl()}/products/${product.slug}`,
            availability:
              product.availability === "in_stock"
                ? "https://schema.org/InStock"
                : product.availability === "out_of_stock"
                  ? "https://schema.org/OutOfStock"
                  : undefined,
          }
        : undefined,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "Products", item: `${getSiteUrl()}/products` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${getSiteUrl()}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <div className="border-b border-[#d9e4e8] bg-[#f6fafc]">
        <nav aria-label="Breadcrumb" className="container-shell flex flex-wrap items-center gap-2 py-4 text-xs text-[#5b6e7a]">
          <Link href="/">Home</Link><ChevronRight className="size-3" aria-hidden="true" />
          <Link href="/products">Products</Link><ChevronRight className="size-3" aria-hidden="true" />
          <Link href={`/products/category/${product.categorySlug}`}>{product.categoryName}</Link>
        </nav>
      </div>
      <section className="section-pad">
        <div className="container-shell grid gap-12 lg:grid-cols-2">
          <div>
            <ProductGallery product={product} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#007d91]">{product.categoryName}</p>
            <h1 className="section-title mt-4">{product.name}</h1>
            {product.sku ? <p className="mt-3 font-mono text-xs text-[#6b7e8a]">Model / SKU: {product.sku}</p> : null}
            <p className="body-large mt-7">{product.shortDescription}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <StatusBadge tone={product.availability === "out_of_stock" ? "warning" : "success"}>
                {availabilityLabels[product.availability]}
              </StatusBadge>
              {product.minimumOrderQuantity ? (
                <span className="text-sm text-[#5b6e7a]">
                  Minimum order: {product.minimumOrderQuantity} {product.minimumOrderUnit}
                </span>
              ) : null}
            </div>
            <div className="mt-8 rounded-2xl border border-[#d9e4e8] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7e8a]">
                {product.showPrice ? "Published price" : "Pricing"}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#072a47]">
                {product.showPrice && product.pricePaise !== null
                  ? formatPrice(product.pricePaise, product.currency)
                  : "Get Latest Price"}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#6b7e8a]">
                Final availability, taxes, delivery and specifications are confirmed in the quotation.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="#product-enquiry">Request a quote</ButtonLink>
                {chatHref ? <ButtonLink href={chatHref} variant="quiet"><MessageCircle className="size-4" aria-hidden="true" /> WhatsApp</ButtonLink> : null}
                {callHref ? <ButtonLink href={callHref} variant="secondary"><Phone className="size-4" aria-hidden="true" /> Call</ButtonLink> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[#d9e4e8] bg-[#f6fafc]">
        <div className="container-shell grid gap-12 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-bold text-[#072a47]">Product description</h2>
            <div className="mt-6"><RichContent value={product.fullDescription} /></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#072a47]">Key specifications</h2>
            {product.specifications.length ? (
              <dl className="mt-6 overflow-hidden rounded-2xl border border-[#d9e4e8] bg-white">
                {product.specifications.map((specification) => (
                  <div key={specification.id} className="grid grid-cols-[0.8fr_1.2fr] gap-4 border-b border-[#e6edef] p-4 last:border-0">
                    <dt className="text-sm font-semibold text-[#425563]">{specification.key}</dt>
                    <dd className="text-sm text-[#172633]">{specification.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-6 rounded-2xl border border-[#d9e4e8] bg-white p-5 text-sm leading-6 text-[#5b6e7a]">
                Detailed specifications are available through a confirmed quotation.
              </p>
            )}
          </div>
        </div>
      </section>

      <section id="product-enquiry" className="section-pad scroll-mt-24">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <span className="eyebrow">Product enquiry</span>
            <h2 className="section-title mt-5">Request confirmed details.</h2>
            <p className="body-large mt-5">Share your quantity and requirements so the team can respond with relevant information.</p>
          </div>
          <div className="surface-card p-6 sm:p-8">
            <InquiryForm productId={product.id} productName={product.name} sourcePage={`/products/${product.slug}`} />
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="section-pad bg-[#f6fafc]">
          <div className="container-shell">
            <h2 className="section-title">Related products</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
