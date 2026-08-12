import { describe, expect, it } from "vitest";
import { buildCategoryTree, getCategoryDescendantIds, type Category } from "@/lib/data";

function category(id: string, name: string, parentId: string | null, displayOrder: number): Category {
  return {
    id,
    name,
    slug: name.toLowerCase().replaceAll(" ", "-"),
    description: `${name} category`,
    imageAlt: `${name} category`,
    parentId,
    mediaAssetId: null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    isActive: true,
    displayOrder,
    status: "published",
    seoTitle: null,
    seoDescription: null,
  };
}

describe("category hierarchy", () => {
  const categories = [
    category("root", "Domestic", null, 10),
    category("child-b", "Wall Mount", "root", 20),
    category("child-a", "Under Sink", "root", 10),
    category("grandchild", "Membranes", "child-a", 10),
  ];

  it("builds ordered nested category nodes", () => {
    const tree = buildCategoryTree(categories);
    expect(tree).toHaveLength(1);
    expect(tree[0].children.map((item) => item.name)).toEqual(["Under Sink", "Wall Mount"]);
    expect(tree[0].children[0].children[0].name).toBe("Membranes");
  });

  it("collects descendants for server-side catalogue filtering", () => {
    expect(new Set(getCategoryDescendantIds(categories, "root"))).toEqual(
      new Set(["root", "child-a", "child-b", "grandchild"]),
    );
  });
});
