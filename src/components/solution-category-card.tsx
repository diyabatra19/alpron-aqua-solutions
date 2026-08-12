import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryVisual } from "@/components/category-visual";
import type { Category } from "@/lib/data";
import { cn } from "@/lib/utils";

export function SolutionCategoryCard({
  category,
  className,
  priority = false,
}: {
  category: Category;
  className?: string;
  priority?: boolean;
}) {
  return (
    <article className={cn("solution-category-card group", className)}>
      <Link href={`/products/category/${category.slug}`} className="flex h-full flex-col">
        <CategoryVisual category={category} priority={priority} className="aspect-[16/10]" />
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="text-xl font-bold tracking-[-0.035em] text-[#052b48] sm:text-2xl">{category.name}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#58707d]">{category.description}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#057b92]">
            Explore category <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
