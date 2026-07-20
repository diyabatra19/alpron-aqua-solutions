import { z } from "zod";
import {
  documentToPlainText,
  plainTextDocument,
  sanitizeRichDocument,
} from "@/lib/content";
import { slugify } from "@/lib/utils";

const optionalEmail = z
  .union([z.literal(""), z.email().max(254)])
  .transform((value) => value || null);

export const inquirySchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^[+()\-\s0-9]+$/, "Enter a valid phone number."),
  email: optionalEmail,
  city: z.string().trim().min(2).max(100),
  productId: z.union([z.literal(""), z.uuid()]).transform((value) => value || null),
  requiredQuantity: z.string().trim().min(1).max(80),
  message: z.string().trim().min(10).max(2000),
  consent: z.literal("on"),
  sourcePage: z.string().trim().min(1).max(300),
  website: z.string().max(0),
  formStartedAt: z.coerce.number().int().positive(),
});

export const loginSchema = z.object({
  email: z.email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(200),
});

export const strongPasswordSchema = z
  .string()
  .min(12)
  .max(200)
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.")
  .regex(/[^A-Za-z0-9]/, "Include a symbol.");

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(12).max(200),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "Choose a different password.",
    path: ["newPassword"],
  });

const productStatuses = ["draft", "published", "archived"] as const;
const availabilityStatuses = [
  "contact_for_availability",
  "in_stock",
  "made_to_order",
  "out_of_stock",
  "discontinued",
] as const;

export const productFormSchema = z
  .object({
    id: z.union([z.literal(""), z.uuid()]).transform((value) => value || null),
    name: z.string().trim().min(2).max(160),
    slug: z.string().trim().max(100).transform((value) => slugify(value)),
    sku: z.string().trim().max(80).transform((value) => value || null),
    categoryId: z.uuid(),
    shortDescription: z.string().trim().min(10).max(500),
    fullDescription: z.string().trim().max(10000),
    priceRupees: z
      .union([z.literal(""), z.coerce.number().nonnegative().max(99999999)])
      .transform((value) => (value === "" ? null : Math.round(value * 100))),
    showPrice: z.boolean(),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
    minimumOrderQuantity: z
      .union([z.literal(""), z.coerce.number().positive().max(999999999)])
      .transform((value) => (value === "" ? null : value)),
    minimumOrderUnit: z.string().trim().max(40).transform((value) => value || null),
    availability: z.enum(availabilityStatuses),
    featured: z.boolean(),
    displayOrder: z.coerce.number().int().min(-10000).max(10000),
    status: z.enum(productStatuses),
    seoTitle: z.string().trim().max(70).transform((value) => value || null),
    seoDescription: z.string().trim().max(170).transform((value) => value || null),
    canonicalUrl: z
      .union([z.literal(""), z.url().refine((url) => /^https?:\/\//.test(url))])
      .transform((value) => value || null),
    sourceUrl: z
      .union([z.literal(""), z.url().refine((url) => /^https?:\/\//.test(url))])
      .transform((value) => value || null),
    verificationStatus: z.enum(["unverified", "verified", "rejected"]),
    specifications: z.string().max(10000),
    mediaIds: z.string().max(5000),
  })
  .refine((value) => !value.showPrice || value.priceRupees !== null, {
    message: "Add a price before enabling price display.",
    path: ["priceRupees"],
  });

export function parseSpecifications(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 100)
    .map((line, order) => {
      const separator = line.indexOf(":");
      if (separator < 1) return null;
      const key = line.slice(0, separator).trim().slice(0, 120);
      const specificationValue = line.slice(separator + 1).trim().slice(0, 300);
      return key && specificationValue
        ? { key, value: specificationValue, order }
        : null;
    })
    .filter(
      (
        item,
      ): item is { key: string; value: string; order: number } => item !== null,
    );
}

export { documentToPlainText, plainTextDocument, sanitizeRichDocument };
