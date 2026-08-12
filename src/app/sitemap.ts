import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [{ products }, categories] = await Promise.all([
    getProducts({ pageSize: 48 }),
    getCategories(),
  ]);
  const staticRoutes = ["", "/products", "/about", "/contact", "/privacy-policy", "/terms"];
  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.6,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/products/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: category.parentId ? 0.65 : 0.75,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
