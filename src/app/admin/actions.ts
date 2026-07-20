"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { plainTextDocument, productFormSchema, parseSpecifications, passwordChangeSchema } from "@/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { InquiryStatus, Json, ProductStatus, VerificationStatus } from "@/lib/database.types";

async function getClient() {
  const client = await createServerSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

export async function logoutAction() {
  await requireAdmin();
  const client = await getClient();
  await client.auth.signOut();
  redirect("/admin/login");
}

export async function saveCategoryAction(formData: FormData) {
  const admin = await requireAdmin(["super_admin", "content_editor"]);
  const schema = z.object({
    id: z.union([z.literal(""), z.uuid()]).transform((value) => value || undefined),
    name: z.string().trim().min(2).max(120),
    slug: z.string().trim().max(100).transform(slugify),
    description: z.string().trim().max(500),
    imageAlt: z.string().trim().max(180),
    displayOrder: z.coerce.number().int().min(-10000).max(10000),
    status: z.enum(["draft", "published", "archived"]),
    seoTitle: z.string().trim().max(70),
    seoDescription: z.string().trim().max(170),
  });
  const parsed = schema.parse(Object.fromEntries(formData));
  const client = await getClient();
  const record = {
    id: parsed.id,
    name: parsed.name,
    slug: parsed.slug || slugify(parsed.name),
    description: parsed.description,
    image_alt: parsed.imageAlt,
    display_order: parsed.displayOrder,
    status: parsed.status,
    seo_title: parsed.seoTitle || null,
    seo_description: parsed.seoDescription || null,
  };
  const { error } = await client.from("categories").upsert(record);
  if (error) throw new Error("The category could not be saved.");
  await client.from("audit_events").insert({
    actor_id: admin.userId,
    event_type: "category.saved",
    entity_type: "category",
    entity_id: parsed.id || record.slug,
  });
  revalidatePath("/", "layout");
  revalidatePath("/products");
  redirect("/admin/categories?saved=1");
}

export async function saveProductAction(formData: FormData) {
  const admin = await requireAdmin(["super_admin", "content_editor"]);
  const parsed = productFormSchema.parse({
    id: formData.get("id") || "",
    name: formData.get("name"),
    slug: formData.get("slug") || formData.get("name"),
    sku: formData.get("sku") || "",
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    fullDescription: formData.get("fullDescription") || "",
    priceRupees: formData.get("priceRupees") || "",
    showPrice: formData.has("showPrice"),
    currency: formData.get("currency") || "INR",
    minimumOrderQuantity: formData.get("minimumOrderQuantity") || "",
    minimumOrderUnit: formData.get("minimumOrderUnit") || "",
    availability: formData.get("availability"),
    featured: formData.has("featured"),
    displayOrder: formData.get("displayOrder") || 0,
    status: formData.get("status"),
    seoTitle: formData.get("seoTitle") || "",
    seoDescription: formData.get("seoDescription") || "",
    canonicalUrl: formData.get("canonicalUrl") || "",
    sourceUrl: formData.get("sourceUrl") || "",
    verificationStatus: formData.get("verificationStatus") || "unverified",
    specifications: formData.get("specifications") || "",
    mediaIds: formData.get("mediaIds") || "",
  });
  const mediaIds = parsed.mediaIds
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter((value) => z.uuid().safeParse(value).success)
    .slice(0, 12);
  if (parsed.verificationStatus === "verified" && admin.role !== "super_admin") {
    throw new Error("Only a super administrator can verify a product.");
  }
  if (parsed.status === "published" && parsed.verificationStatus !== "verified") {
    throw new Error("A product must be verified before it can be published.");
  }
  const payload: Json = {
    id: parsed.id,
    name: parsed.name,
    slug: parsed.slug || slugify(parsed.name),
    sku: parsed.sku,
    category_id: parsed.categoryId,
    short_description: parsed.shortDescription,
    full_description: plainTextDocument(parsed.fullDescription),
    price_paise: parsed.priceRupees,
    show_price: parsed.showPrice,
    currency: parsed.currency,
    minimum_order_quantity: parsed.minimumOrderQuantity,
    minimum_order_unit: parsed.minimumOrderUnit,
    availability: parsed.availability,
    featured: parsed.featured,
    display_order: parsed.displayOrder,
    status: parsed.status,
    seo_title: parsed.seoTitle,
    seo_description: parsed.seoDescription,
    canonical_url: parsed.canonicalUrl,
    source_url: parsed.sourceUrl,
    verification_status: parsed.verificationStatus,
  };
  const client = await getClient();
  const { error } = await client.rpc("save_product", {
    p_product: payload,
    p_specifications: parseSpecifications(parsed.specifications) as unknown as Json,
    p_media_ids: mediaIds,
  });
  if (error) throw new Error("The product could not be saved.");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.slug}`);
  redirect("/admin/products?saved=1");
}

export async function savePageAction(formData: FormData) {
  const admin = await requireAdmin(["super_admin", "content_editor"]);
  const schema = z.object({
    id: z.uuid(),
    slug: z.string().min(1).max(100),
    title: z.string().trim().min(2).max(160),
    body: z.string().trim().max(20000),
    status: z.enum(["draft", "published", "archived"]),
    seoTitle: z.string().trim().max(70),
    seoDescription: z.string().trim().max(170),
    canonicalUrl: z.union([z.literal(""), z.url()]),
  });
  const parsed = schema.parse(Object.fromEntries(formData));
  const client = await getClient();
  const content = plainTextDocument(parsed.body);
  const { error } = await client
    .from("pages")
    .update({
      title: parsed.title,
      content,
      status: parsed.status,
      seo_title: parsed.seoTitle || null,
      seo_description: parsed.seoDescription || null,
      canonical_url: parsed.canonicalUrl || null,
      published_at: parsed.status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.id);
  if (error) throw new Error("The page could not be saved.");
  await client.from("page_versions").insert({
    page_id: parsed.id,
    title: parsed.title,
    content,
    created_by: admin.userId,
  });
  await client.from("audit_events").insert({
    actor_id: admin.userId,
    event_type: "page.saved",
    entity_type: "page",
    entity_id: parsed.id,
  });
  revalidatePath(`/${parsed.slug === "home" ? "" : parsed.slug}`);
  redirect("/admin/pages?saved=1");
}

export async function saveSettingsAction(formData: FormData) {
  const admin = await requireAdmin(["super_admin"]);
  const schema = z.object({
    brandName: z.string().trim().min(2).max(100),
    defaultSeoTitle: z.string().trim().min(10).max(70),
    defaultSeoDescription: z.string().trim().min(30).max(170),
    heroTitle: z.string().trim().min(10).max(140),
    heroDescription: z.string().trim().min(20).max(500),
    aboutTitle: z.string().trim().min(10).max(160),
    aboutSummary: z.string().trim().min(20).max(1500),
    whyChooseIntro: z.string().trim().min(20).max(1000),
    orderingIntro: z.string().trim().min(20).max(1000),
    orderingProcess: z.string().trim().min(20).max(3000),
    contactIntro: z.string().trim().min(20).max(1000),
    ctaTitle: z.string().trim().min(10).max(160),
    ctaDescription: z.string().trim().min(20).max(600),
  });
  const parsed = schema.parse(Object.fromEntries(formData));
  const client = await getClient();
  const { error } = await client
    .from("site_settings")
    .update({
      brand_name: parsed.brandName,
      default_seo_title: parsed.defaultSeoTitle,
      default_seo_description: parsed.defaultSeoDescription,
      hero_title: parsed.heroTitle,
      hero_description: parsed.heroDescription,
      about_title: parsed.aboutTitle,
      about_summary: parsed.aboutSummary,
      why_choose_intro: parsed.whyChooseIntro,
      ordering_intro: parsed.orderingIntro,
      ordering_process: parsed.orderingProcess,
      contact_intro: parsed.contactIntro,
      cta_title: parsed.ctaTitle,
      cta_description: parsed.ctaDescription,
      updated_by: admin.userId,
    })
    .eq("id", true);
  if (error) throw new Error("Settings could not be saved.");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function saveBusinessFactAction(formData: FormData) {
  const admin = await requireAdmin(["super_admin"]);
  const schema = z.object({
    id: z.uuid(),
    value: z.string().trim().max(1000),
    verificationStatus: z.enum(["unverified", "verified", "rejected"]),
    publicVisible: z.boolean(),
  });
  const parsed = schema.parse({
    id: formData.get("id"),
    value: formData.get("value") || "",
    verificationStatus: formData.get("verificationStatus"),
    publicVisible: formData.has("publicVisible"),
  });
  if (parsed.publicVisible && parsed.verificationStatus !== "verified") {
    throw new Error("Only verified facts may be public.");
  }
  const client = await getClient();
  const { error } = await client
    .from("business_facts")
    .update({
      fact_value: parsed.value || null,
      verification_status: parsed.verificationStatus as VerificationStatus,
      public_visible: parsed.publicVisible,
      verified_at: parsed.verificationStatus === "verified" ? new Date().toISOString() : null,
      verified_by: parsed.verificationStatus === "verified" ? admin.userId : null,
    })
    .eq("id", parsed.id);
  if (error) throw new Error("The business fact could not be saved.");
  await client.from("audit_events").insert({
    actor_id: admin.userId,
    event_type: "business_fact.saved",
    entity_type: "business_fact",
    entity_id: parsed.id,
  });
  revalidatePath("/", "layout");
  redirect("/admin/settings?factSaved=1");
}

export async function updateInquiryAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const status = z
    .enum(["new", "contacted", "qualified", "closed", "spam"])
    .parse(formData.get("status")) as InquiryStatus;
  const client = await getClient();
  const { error } = await client.from("inquiries").update({ status }).eq("id", id);
  if (error) throw new Error("The enquiry status could not be saved.");
  await client.from("audit_events").insert({
    actor_id: admin.userId,
    event_type: "inquiry.status_changed",
    entity_type: "inquiry",
    entity_id: id,
    metadata: { status },
  });
  revalidatePath("/admin/inquiries");
}

export async function addInquiryNoteAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  const note = z.string().trim().min(1).max(2000).parse(formData.get("note"));
  const client = await getClient();
  const { error } = await client.from("inquiry_notes").insert({
    inquiry_id: id,
    note,
    created_by: admin.userId,
  });
  if (error) throw new Error("The private note could not be saved.");
  revalidatePath("/admin/inquiries");
}

export async function changePasswordAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = passwordChangeSchema.parse(Object.fromEntries(formData));
  const client = await getClient();
  const { error: reauthError } = await client.auth.signInWithPassword({
    email: admin.email,
    password: parsed.currentPassword,
  });
  if (reauthError) throw new Error("The current password was not accepted.");
  const { error } = await client.auth.updateUser({ password: parsed.newPassword });
  if (error) throw new Error("The password could not be updated.");
  await client.from("audit_events").insert({
    actor_id: admin.userId,
    event_type: "admin.password_changed",
    entity_type: "admin_profile",
    entity_id: admin.userId,
  });
  redirect("/admin/settings?password=changed");
}

export async function archiveProductAction(formData: FormData) {
  const admin = await requireAdmin(["super_admin", "content_editor"]);
  const id = z.uuid().parse(formData.get("id"));
  const client = await getClient();
  const { error } = await client
    .from("products")
    .update({ status: "archived" as ProductStatus, featured: false })
    .eq("id", id);
  if (error) throw new Error("The product could not be archived.");
  await client.from("audit_events").insert({
    actor_id: admin.userId,
    event_type: "product.archived",
    entity_type: "product",
    entity_id: id,
  });
  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products?archived=1");
}
