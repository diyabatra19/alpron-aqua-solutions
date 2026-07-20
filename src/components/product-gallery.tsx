"use client";

import Image from "next/image";
import { Expand, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductVisual } from "@/components/product-visual";
import type { Product } from "@/lib/data";

export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const image = product.images[selected];

  useEffect(() => {
    if (!expanded) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [expanded]);

  if (!product.images.length) {
    return <ProductVisual product={product} priority className="aspect-square rounded-[2rem]" />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="group relative block aspect-square w-full overflow-hidden rounded-[2rem] border border-[#d2e5e9] bg-[#edf7f8]"
        aria-label={`Enlarge ${image.alt}`}
      >
        <Image src={image.url} alt={image.alt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-5 transition duration-500 group-hover:scale-[1.025]" />
        <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full border border-white/70 bg-white/88 text-[#07324e] shadow-lg backdrop-blur">
          <Expand className="size-4" aria-hidden="true" />
        </span>
      </button>
      {product.images.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3" role="list" aria-label="Product images">
          {product.images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show ${item.alt}`}
              aria-pressed={selected === index}
              className="relative aspect-square overflow-hidden rounded-xl border bg-[#edf7f8] aria-pressed:border-[#00899b] aria-pressed:ring-2 aria-pressed:ring-[#9de3e7]"
            >
              <Image src={item.url} alt="" fill sizes="20vw" className="object-contain p-2" />
            </button>
          ))}
        </div>
      ) : null}
      {expanded ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-[#021522]/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${product.name} image preview`}>
          <button type="button" onClick={() => setExpanded(false)} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white text-[#072f4c]" aria-label="Close image preview">
            <X className="size-5" aria-hidden="true" />
          </button>
          <div className="relative h-[min(82vh,900px)] w-[min(92vw,1100px)]">
            <Image src={image.url} alt={image.alt} fill sizes="92vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
