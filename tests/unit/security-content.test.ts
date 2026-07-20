import { describe, expect, it } from "vitest";
import { sanitizeRichDocument } from "@/lib/content";
import { formatPrice, safeExternalUrl, slugify } from "@/lib/utils";

describe("content safety", () => {
  it("removes unsupported nodes and unsafe link protocols", () => {
    const result = sanitizeRichDocument({
      type: "doc",
      content: [
        { type: "script", text: "alert(1)" },
        { type: "link", href: "javascript:alert(1)", text: "bad" },
        { type: "paragraph", text: "Safe copy" },
      ],
    });
    expect(result.content).toEqual([{ type: "paragraph", text: "Safe copy" }]);
  });

  it("allows only HTTP external links", () => {
    expect(safeExternalUrl("https://example.com")).toBe("https://example.com/");
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("catalogue helpers", () => {
  it("creates permanent URL-safe slugs", () => {
    expect(slugify("RO Water Purifier Body!")).toBe("ro-water-purifier-body");
  });

  it("formats integer paise without browser input", () => {
    expect(formatPrice(12345)).toContain("123.45");
  });
});
