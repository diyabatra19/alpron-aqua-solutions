import type {
  AvailabilityStatus,
  InquiryStatus,
  Json,
  ProductStatus,
  VerificationStatus,
} from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageAlt: string;
  displayOrder: number;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type ProductImage = {
  id: string;
  mediaAssetId: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  displayOrder: number;
};

export type ProductSpecification = {
  id: string;
  key: string;
  value: string;
  displayOrder: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  shortDescription: string;
  fullDescription: Json;
  pricePaise: number | null;
  showPrice: boolean;
  currency: string;
  minimumOrderQuantity: number | null;
  minimumOrderUnit: string | null;
  availability: AvailabilityStatus;
  featured: boolean;
  displayOrder: number;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  sourceUrl: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
};

export type SiteSettings = {
  brandName: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  heroTitle: string;
  heroDescription: string;
  aboutTitle: string;
  aboutSummary: string;
  whyChooseIntro: string;
  orderingIntro: string;
  orderingProcess: string[];
  contactIntro: string;
  ctaTitle: string;
  ctaDescription: string;
};

export type BusinessFact = {
  id: string;
  key: string;
  label: string;
  value: string | null;
  verificationStatus: VerificationStatus;
  publicVisible: boolean;
  sourceUrl: string | null;
};

export type EditablePage = {
  id: string;
  slug: string;
  title: string;
  content: Json;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
};

export type Inquiry = {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  city: string;
  productId: string | null;
  requiredQuantity: string;
  message: string;
  sourcePage: string;
  status: InquiryStatus;
  submittedAt: string;
};

const fallbackCategories: Category[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "RO Water Purifiers",
    slug: "ro-water-purifiers",
    description:
      "Explore RO water purifier options after product details are verified and published.",
    imageAlt:
      "RO water purifier category placeholder awaiting approved product photography",
    displayOrder: 10,
    status: "published",
    seoTitle: "RO Water Purifiers | Alpron Aqua Solutions",
    seoDescription:
      "Browse published RO water purifier options from Alpron Aqua Solutions.",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "RO Water Purifier Bodies",
    slug: "ro-water-purifier-bodies",
    description:
      "Purifier body options will appear after models and specifications are confirmed.",
    imageAlt:
      "RO water purifier body category placeholder awaiting approved product photography",
    displayOrder: 20,
    status: "published",
    seoTitle: "RO Water Purifier Bodies | Alpron Aqua Solutions",
    seoDescription:
      "Browse published RO water purifier body options from Alpron Aqua Solutions.",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Water Filters",
    slug: "water-filters",
    description:
      "Water filter products will appear after specifications are approved.",
    imageAlt: "Water filter category placeholder awaiting approved product photography",
    displayOrder: 30,
    status: "published",
    seoTitle: "Water Filters | Alpron Aqua Solutions",
    seoDescription:
      "Browse published water filter options from Alpron Aqua Solutions.",
  },
];

const fallbackSettings: SiteSettings = {
  brandName: "Alpron Aqua Solutions",
  defaultSeoTitle: "Alpron Aqua Solutions | RO Water Purifiers & Filters",
  defaultSeoDescription:
    "RO water purifier products, purifier bodies and water filters for enquiries across Delhi/NCR.",
  heroTitle: "Water purification products, presented with clarity.",
  heroDescription:
    "Explore RO water purifiers, purifier bodies and water filters, then request a quotation for confirmed product details.",
  aboutTitle: "Water purification products for practical requirements.",
  aboutSummary:
    "Alpron Aqua Solutions supplies RO water purifiers, purifier bodies and water filters through a quotation-led catalogue.",
  whyChooseIntro:
    "Clear product categories and verified public information make it easier to discuss the right requirement.",
  orderingIntro:
    "Every order begins with a product enquiry so the applicable details can be confirmed.",
  orderingProcess: [
    "Browse the published product range",
    "Open the product that fits your requirement",
    "Choose Request a Quote",
    "Enter your contact details and required quantity",
    "Submit the enquiry",
    "The team confirms price, availability, delivery and payment",
  ],
  contactIntro:
    "Send a product or general quotation enquiry with your city, quantity and requirement.",
  ctaTitle: "Ready to discuss a purifier or supply requirement?",
  ctaDescription:
    "Choose a product or send a general enquiry for confirmed availability and pricing.",
};

const fallbackPages: Record<string, EditablePage> = {
  about: {
    id: "about",
    slug: "about",
    title: "About Alpron Aqua Solutions",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          text: "Alpron Aqua Solutions serves enquiries for RO water purification products and components. Legal and operational details will be added after client verification.",
        },
      ],
    },
    status: "published",
    seoTitle: "About Alpron Aqua Solutions",
    seoDescription:
      "Learn about Alpron Aqua Solutions and its water purification product categories.",
    canonicalUrl: null,
  },
  "privacy-policy": {
    id: "privacy-policy",
    slug: "privacy-policy",
    title: "Privacy Policy",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          text: "This website collects information submitted through quotation and contact forms to respond to enquiries. Final legal text requires client review before launch.",
        },
      ],
    },
    status: "published",
    seoTitle: "Privacy Policy | Alpron Aqua Solutions",
    seoDescription:
      "Read the website privacy information for Alpron Aqua Solutions.",
    canonicalUrl: null,
  },
  terms: {
    id: "terms",
    slug: "terms",
    title: "Terms of Use",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          text: "Product details and availability are subject to confirmation through a formal quotation. Final legal terms require client review before launch.",
        },
      ],
    },
    status: "published",
    seoTitle: "Terms of Use | Alpron Aqua Solutions",
    seoDescription:
      "Read the website terms of use for Alpron Aqua Solutions.",
    canonicalUrl: null,
  },
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const client = await createServerSupabaseClient();
  if (!client) return fallbackSettings;
  const { data } = await client.from("site_settings").select("*").eq("id", true).maybeSingle();
  if (!data) return fallbackSettings;
  return {
    brandName: data.brand_name,
    defaultSeoTitle: data.default_seo_title,
    defaultSeoDescription: data.default_seo_description,
    heroTitle: data.hero_title,
    heroDescription: data.hero_description,
    aboutTitle: data.about_title || fallbackSettings.aboutTitle,
    aboutSummary: data.about_summary || fallbackSettings.aboutSummary,
    whyChooseIntro: data.why_choose_intro || fallbackSettings.whyChooseIntro,
    orderingIntro: data.ordering_intro || fallbackSettings.orderingIntro,
    orderingProcess: (data.ordering_process || fallbackSettings.orderingProcess.join("\n"))
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean)
      .slice(0, 8),
    contactIntro: data.contact_intro || fallbackSettings.contactIntro,
    ctaTitle: data.cta_title || fallbackSettings.ctaTitle,
    ctaDescription: data.cta_description || fallbackSettings.ctaDescription,
  };
}

export async function getCategories(includeUnpublished = false): Promise<Category[]> {
  const client = await createServerSupabaseClient();
  if (!client) return fallbackCategories;
  let query = client.from("categories").select("*").order("display_order");
  if (!includeUnpublished) query = query.eq("status", "published");
  const { data } = await query;
  if (!data) return [];
  return data.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageAlt: category.image_alt,
    displayOrder: category.display_order,
    status: category.status,
    seoTitle: category.seo_title,
    seoDescription: category.seo_description,
  }));
}

type RawProduct = Record<string, unknown> & {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string;
  short_description: string;
  full_description: Json;
  price_paise: number | null;
  show_price: boolean;
  currency: string;
  minimum_order_quantity: number | null;
  minimum_order_unit: string | null;
  availability: AvailabilityStatus;
  featured: boolean;
  display_order: number;
  status: ProductStatus;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  source_url: string | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string } | null;
  product_images?: Array<{
    id: string;
    media_asset_id: string;
    alt_text: string;
    display_order: number;
    media_assets?: {
      public_url: string;
      width: number;
      height: number;
    } | null;
  }>;
  product_specifications?: Array<{
    id: string;
    specification_key: string;
    specification_value: string;
    display_order: number;
  }>;
};

function mapProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    sku: raw.sku,
    categoryId: raw.category_id,
    categoryName: raw.categories?.name || "Uncategorized",
    categorySlug: raw.categories?.slug || "",
    shortDescription: raw.short_description,
    fullDescription: raw.full_description,
    pricePaise: raw.price_paise,
    showPrice: raw.show_price,
    currency: raw.currency,
    minimumOrderQuantity: raw.minimum_order_quantity,
    minimumOrderUnit: raw.minimum_order_unit,
    availability: raw.availability,
    featured: raw.featured,
    displayOrder: raw.display_order,
    status: raw.status,
    seoTitle: raw.seo_title,
    seoDescription: raw.seo_description,
    canonicalUrl: raw.canonical_url,
    sourceUrl: raw.source_url,
    verificationStatus: raw.verification_status,
    verifiedAt: raw.verified_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    images: (raw.product_images || [])
      .filter((image) => image.media_assets)
      .map((image) => ({
        id: image.id,
        mediaAssetId: image.media_asset_id,
        url: image.media_assets?.public_url || "",
        alt: image.alt_text,
        width: image.media_assets?.width || 1,
        height: image.media_assets?.height || 1,
        displayOrder: image.display_order,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder),
    specifications: (raw.product_specifications || [])
      .map((specification) => ({
        id: specification.id,
        key: specification.specification_key,
        value: specification.specification_value,
        displayOrder: specification.display_order,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

const productSelection =
  "*, categories(name,slug), product_images(id,media_asset_id,alt_text,display_order,media_assets(public_url,width,height)), product_specifications(id,specification_key,specification_value,display_order)";

export async function getProducts(options?: {
  search?: string;
  category?: string;
  availability?: AvailabilityStatus | "";
  sort?: string;
  page?: number;
  pageSize?: number;
  featured?: boolean;
  includeUnpublished?: boolean;
}) {
  const client = await createServerSupabaseClient();
  const page = Math.max(1, options?.page || 1);
  const pageSize = Math.min(48, Math.max(1, options?.pageSize || 12));
  if (!client) return { products: [] as Product[], count: 0, page, pageSize };

  let query = client
    .from("products")
    .select(productSelection, { count: "exact" });

  if (!options?.includeUnpublished) {
    query = query.eq("status", "published").eq("verification_status", "verified");
  }
  if (options?.search) query = query.ilike("name", `%${options.search.slice(0, 80)}%`);
  if (options?.availability) query = query.eq("availability", options.availability);
  if (options?.featured !== undefined) query = query.eq("featured", options.featured);
  if (options?.category) {
    const categories = await getCategories(options.includeUnpublished);
    const category = categories.find((item) => item.slug === options.category);
    if (!category) return { products: [] as Product[], count: 0, page, pageSize };
    query = query.eq("category_id", category.id);
  }

  if (options?.sort === "name") query = query.order("name");
  else if (options?.sort === "newest") query = query.order("created_at", { ascending: false });
  else query = query.order("display_order").order("name");

  const start = (page - 1) * pageSize;
  const { data, count } = await query.range(start, start + pageSize - 1);
  return {
    products: ((data || []) as unknown as RawProduct[]).map(mapProduct),
    count: count || 0,
    page,
    pageSize,
  };
}

export async function getProductBySlug(slug: string, includeUnpublished = false) {
  const client = await createServerSupabaseClient();
  if (!client) return null;
  let query = client
    .from("products")
    .select(productSelection)
    .eq("slug", slug);
  if (!includeUnpublished) {
    query = query.eq("status", "published").eq("verification_status", "verified");
  }
  const { data } = await query.maybeSingle();
  return data ? mapProduct(data as unknown as RawProduct) : null;
}

export async function getPageBySlug(
  slug: string,
  includeUnpublished = false,
): Promise<EditablePage | null> {
  const client = await createServerSupabaseClient();
  if (!client) return fallbackPages[slug] || null;
  let query = client.from("pages").select("*").eq("slug", slug);
  if (!includeUnpublished) query = query.eq("status", "published");
  const { data } = await query.maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    content: data.content,
    status: data.status,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    canonicalUrl: data.canonical_url,
  };
}

export async function getBusinessFacts(includeUnverified = false) {
  const client = await createServerSupabaseClient();
  if (!client) return [] as BusinessFact[];
  let query = client.from("business_facts").select("*").order("label");
  if (!includeUnverified) {
    query = query.eq("verification_status", "verified").eq("public_visible", true);
  }
  const { data } = await query;
  return (data || []).map((fact) => ({
    id: fact.id,
    key: fact.fact_key,
    label: fact.label,
    value: fact.fact_value,
    verificationStatus: fact.verification_status,
    publicVisible: fact.public_visible,
    sourceUrl: fact.source_url,
  }));
}

export async function getAdminInquiries(): Promise<Inquiry[]> {
  const client = await createServerSupabaseClient();
  if (!client) return [];
  const { data } = await client
    .from("inquiries")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(250);
  return (data || []).map((inquiry) => ({
    id: inquiry.id,
    customerName: inquiry.customer_name,
    phone: inquiry.phone,
    email: inquiry.email,
    city: inquiry.city,
    productId: inquiry.product_id,
    requiredQuantity: inquiry.required_quantity,
    message: inquiry.message,
    sourcePage: inquiry.source_page,
    status: inquiry.status,
    submittedAt: inquiry.submitted_at,
  }));
}

export async function getInquiryNotes() {
  const client = await createServerSupabaseClient();
  if (!client) return [];
  const { data } = await client
    .from("inquiry_notes")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getAdminPages() {
  const client = await createServerSupabaseClient();
  if (!client) return Object.values(fallbackPages);
  const { data } = await client.from("pages").select("*").order("slug");
  return (data || []).map((page) => ({
    id: page.id,
    slug: page.slug,
    title: page.title,
    content: page.content,
    status: page.status,
    seoTitle: page.seo_title,
    seoDescription: page.seo_description,
    canonicalUrl: page.canonical_url,
  })) satisfies EditablePage[];
}

export async function getMediaAssets() {
  if (!isSupabaseConfigured()) return [];
  const client = await createServerSupabaseClient();
  if (!client) return [];
  const { data } = await client
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}
