import { describe, expect, it } from "vitest";
import {
  inquirySchema,
  parseSpecifications,
  productFormSchema,
} from "@/lib/validation";

describe("inquiry validation", () => {
  const valid = {
    customerName: "Asha Verma",
    phone: "+91 98765 43210",
    email: "",
    city: "Delhi",
    productId: "",
    requiredQuantity: "10 units",
    message: "Please share confirmed specifications.",
    consent: "on",
    sourcePage: "/contact",
    website: "",
    formStartedAt: Date.now() - 5000,
  };

  it("accepts a valid consented enquiry", () => {
    expect(inquirySchema.parse(valid).email).toBeNull();
  });

  it("rejects honeypot content and invalid phones", () => {
    expect(inquirySchema.safeParse({ ...valid, website: "spam.example" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, phone: "call-me" }).success).toBe(false);
  });
});

describe("product validation", () => {
  const base = {
    id: "",
    name: "Sample product",
    slug: "sample-product",
    sku: "",
    categoryId: "00000000-0000-4000-8000-000000000001",
    shortDescription: "A deliberately generic sample description.",
    fullDescription: "",
    priceRupees: "",
    showPrice: false,
    currency: "INR",
    minimumOrderQuantity: "",
    minimumOrderUnit: "",
    availability: "made_to_order",
    featured: false,
    displayOrder: 0,
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    sourceUrl: "",
    verificationStatus: "unverified",
    specifications: "",
    mediaIds: "",
  };

  it("converts rupees to integer paise", () => {
    const parsed = productFormSchema.parse({ ...base, priceRupees: "123.45" });
    expect(parsed.priceRupees).toBe(12345);
  });

  it("requires a value when price display is enabled", () => {
    expect(productFormSchema.safeParse({ ...base, showPrice: true }).success).toBe(false);
  });

  it("parses ordered key/value specifications", () => {
    expect(parseSpecifications("Capacity: 10 L\nVoltage: 24 V")).toEqual([
      { key: "Capacity", value: "10 L", order: 0 },
      { key: "Voltage", value: "24 V", order: 1 },
    ]);
  });
});
