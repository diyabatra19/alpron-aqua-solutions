import Image from "next/image";
import { Box, Droplets, Layers3 } from "lucide-react";
import type { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ProductVisual({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const image = product.images[0];
  if (image) {
    return (
      <div className={cn("relative overflow-hidden bg-[#eaf7f8]", className)}>
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-5 transition duration-500 group-hover:scale-[1.035]"
        />
      </div>
    );
  }

  const Icon =
    product.categorySlug === "ro-water-purifier-bodies"
      ? Box
      : product.categorySlug === "water-filters"
        ? Layers3
        : Droplets;

  return (
    <div
      className={cn(
        "product-placeholder relative isolate grid overflow-hidden bg-[#eaf7f8]",
        className,
      )}
      role="img"
      aria-label={`${product.name} image placeholder awaiting client-approved product photography`}
    >
      <div className="absolute inset-x-[16%] bottom-[11%] top-[10%] rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_30px_80px_rgba(4,48,74,0.16)] backdrop-blur">
        <div className="absolute inset-x-[12%] top-[10%] h-[42%] overflow-hidden rounded-[1.35rem] border border-[#b8e7ea] bg-[#d9f7f7]">
          <span className="water-sheen absolute inset-0" />
          <Icon className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-[#057b8d]" aria-hidden="true" />
        </div>
        <div className="absolute inset-x-[16%] bottom-[16%]">
          <span className="block h-2 rounded-full bg-[#d4e4e9]" />
          <span className="mt-3 block h-2 w-3/4 rounded-full bg-[#e3edf0]" />
        </div>
      </div>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.11em] text-[#53717d] shadow-sm">
        Client image pending
      </span>
    </div>
  );
}
