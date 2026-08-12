import Image from "next/image";
import {
  Beaker,
  Boxes,
  Droplets,
  Factory,
  Settings2,
  Snowflake,
  Waves,
  Wrench,
} from "lucide-react";
import type { Category } from "@/lib/data";
import { cn } from "@/lib/utils";

const approvedFallbackImages: Record<string, string> = {
  "domestic-ro-systems": "/assets/products/filter-assemblies/domestic-ro-filter-assembly.webp",
  "commercial-industrial-ro-systems": "/assets/products/commercial-ro/commercial-ro-plant-50-lph.webp",
  "commercial-ro-plants": "/assets/products/commercial-ro/commercial-ro-plant-50-lph.webp",
  "spare-parts": "/assets/products/filter-assemblies/domestic-ro-filter-assembly.webp",
};

const visualIcons = {
  "domestic-ro-systems": Droplets,
  "commercial-industrial-ro-systems": Factory,
  "water-chemicals": Beaker,
  "stainless-steel-water-coolers": Snowflake,
  "water-softeners": Waves,
  "spare-parts": Settings2,
  "installation-services": Wrench,
} as const;

export function CategoryVisual({
  category,
  className,
  priority = false,
}: {
  category: Category;
  className?: string;
  priority?: boolean;
}) {
  const imageUrl = category.imageUrl || approvedFallbackImages[category.slug];
  if (imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-[#eff7f9]", className)}>
        <Image
          src={imageUrl}
          alt={category.imageAlt || `${category.name} category`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-6 transition duration-500 group-hover:scale-[1.035]"
        />
        <span className="category-image-wash absolute inset-0" aria-hidden="true" />
      </div>
    );
  }

  const Icon = visualIcons[category.slug as keyof typeof visualIcons] || Boxes;
  return (
    <div
      className={cn("category-visual-placeholder relative grid place-items-center overflow-hidden", className)}
      role="img"
      aria-label={category.imageAlt || `${category.name} category illustration`}
    >
      <div className="category-visual-orbit" aria-hidden="true" />
      <span className="relative grid size-20 place-items-center rounded-[1.6rem] border border-white/80 bg-white/75 text-[#076f8b] shadow-[0_20px_55px_rgba(4,63,89,0.14)] backdrop-blur-sm">
        <Icon className="size-9" aria-hidden="true" />
      </span>
    </div>
  );
}
