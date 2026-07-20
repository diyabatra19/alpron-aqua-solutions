import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const { products } = await getProducts({ pageSize: 48 });
  const staticRoutes = ["", "/products", "/about", "/contact", "/privacy-policy", "/terms"];
  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.6,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
