import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/data";
import { ProductVisual } from "@/components/product-visual";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group surface-card product-card overflow-hidden">
      <Link href={`/products/${product.slug}`} className="block h-full">
        <ProductVisual product={product} className="aspect-[4/3]" />
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#007d91]">
            {product.categoryName}
          </p>
          <h2 className="mt-3 text-xl font-bold tracking-[-0.025em] text-[#072a47]">
            {product.name}
          </h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5b6e7a]">
            {product.shortDescription}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-[#e1eaed] pt-5">
            <span className="font-semibold text-[#072a47]">
              {product.showPrice && product.pricePaise !== null
                ? formatPrice(product.pricePaise, product.currency)
                : "Request a Quote"}
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-[#e5f8f8] text-[#007d91] transition group-hover:translate-x-1 group-hover:bg-[#007d91] group-hover:text-white">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
