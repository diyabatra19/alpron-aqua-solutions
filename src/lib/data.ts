import type {
  AvailabilityStatus,
  InquiryStatus,
  Json,
  ProductStatus,
  VerificationStatus,
} from "@/lib/database.types";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageAlt: string;
  parentId: string | null;
  mediaAssetId: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  isActive: boolean;
  displayOrder: number;
  status: ProductStatus;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CategoryNode = Category & { children: CategoryNode[] };

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
    name: "Domestic RO Systems",
    slug: "domestic-ro-systems",
    description:
      "Domestic reverse-osmosis and multi-stage purifier categories for household requirements.",
    imageAlt: "Domestic RO filtration system",
    parentId: null,
    mediaAssetId: null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    isActive: true,
    displayOrder: 10,
    status: "published",
    seoTitle: "Domestic RO Systems | Alpron Aqua Solutions",
    seoDescription:
      "Explore domestic RO system categories from Alpron Aqua Solutions.",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Commercial & Industrial RO Systems",
    slug: "commercial-industrial-ro-systems",
    description:
      "Commercial and industrial reverse-osmosis plant categories organised by capacity, equipment and application.",
    imageAlt: "Commercial reverse-osmosis plant",
    parentId: null,
    mediaAssetId: null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    isActive: true,
    displayOrder: 20,
    status: "published",
    seoTitle: "Commercial & Industrial RO Systems | Alpron Aqua Solutions",
    seoDescription:
      "Explore commercial and industrial RO system categories from Alpron Aqua Solutions.",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Water Chemicals",
    slug: "water-chemicals",
    description:
      "RO, boiler, cooling-tower and water-treatment chemical categories for requirement-led enquiries.",
    imageAlt: "Water treatment chemical category",
    parentId: null,
    mediaAssetId: null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    isActive: true,
    displayOrder: 30,
    status: "published",
    seoTitle: "Water Treatment Chemicals | Alpron Aqua Solutions",
    seoDescription:
      "Explore water treatment chemical categories from Alpron Aqua Solutions.",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "Stainless Steel Water Coolers",
    slug: "stainless-steel-water-coolers",
    description: "Stainless-steel water cooler categories by installation, application and capacity.",
    imageAlt: "Stainless steel water cooler category",
    parentId: null,
    mediaAssetId: null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    isActive: true,
    displayOrder: 40,
    status: "published",
    seoTitle: "Stainless Steel Water Coolers | Alpron Aqua Solutions",
    seoDescription: "Explore stainless steel water cooler categories from Alpron Aqua Solutions.",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    name: "Water Softeners",
    slug: "water-softeners",
    description: "Domestic, commercial and industrial water-softener categories with related accessories.",
    imageAlt: "Water softener system category",
    parentId: null,
    mediaAssetId: null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    isActive: true,
    displayOrder: 50,
    status: "published",
    seoTitle: "Water Softeners | Alpron Aqua Solutions",
    seoDescription: "Explore water softener categories from Alpron Aqua Solutions.",
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    name: "Spare Parts",
    slug: "spare-parts",
    description: "Replacement components and consumables for purifier and water-treatment requirements.",
    imageAlt: "RO spare parts and components category",
    parentId: null,
    mediaAssetId: null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    isActive: true,
    displayOrder: 60,
    status: "published",
    seoTitle: "RO Spare Parts | Alpron Aqua Solutions",
    seoDescription: "Explore RO spare parts and component categories from Alpron Aqua Solutions.",
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    name: "Installation & Services",
    slug: "installation-services",
    description: "Installation, maintenance, testing and commissioning service categories.",
    imageAlt: "RO installation and maintenance category",
    parentId: null,
    mediaAssetId: null,
    imageUrl: null,
    imageWidth: null,
    imageHeight: null,
    isActive: true,
    displayOrder: 70,
    status: "published",
    seoTitle: "RO Installation & Services | Alpron Aqua Solutions",
    seoDescription: "Explore RO installation and maintenance service categories.",
  },
];

type FallbackCategoryBranch = {
  name: string;
  slug: string;
  children?: FallbackCategoryBranch[];
};

const fallbackCategoryBranches: Record<string, FallbackCategoryBranch[]> = {
  "domestic-ro-systems": [
    { name: "Under Sink RO", slug: "under-sink-ro" },
    { name: "Wall Mount RO", slug: "wall-mount-ro" },
    { name: "Table Top RO", slug: "table-top-ro" },
    { name: "RO + UV Water Purifier", slug: "ro-uv-water-purifier" },
    { name: "RO + UF Water Purifier", slug: "ro-uf-water-purifier" },
    { name: "RO + UV + UF + TDS Controller", slug: "ro-uv-uf-tds-controller" },
    { name: "Copper RO", slug: "copper-ro" },
    { name: "Alkaline RO", slug: "alkaline-ro" },
    { name: "Hot & Normal RO", slug: "hot-normal-ro" },
    { name: "Smart RO Purifiers", slug: "smart-ro-purifiers" },
    {
      name: "Domestic Spare Parts",
      slug: "domestic-ro-spare-parts",
      children: [
        ["RO Membranes", "domestic-ro-membranes"],
        ["Sediment Filters", "domestic-sediment-filters"],
        ["Carbon Filters", "domestic-carbon-filters"],
        ["Post Carbon Filters", "domestic-post-carbon-filters"],
        ["UV Lamps", "domestic-uv-lamps"],
        ["Booster Pumps", "domestic-booster-pumps"],
        ["Solenoid Valves", "domestic-solenoid-valves"],
        ["SMPS/Adapters", "domestic-smps-adapters"],
        ["Faucets", "domestic-faucets"],
        ["Storage Tanks", "domestic-storage-tanks"],
      ].map(([name, slug]) => ({ name, slug })),
    },
  ],
  "commercial-industrial-ro-systems": [
    {
      name: "Commercial RO Plants",
      slug: "commercial-ro-plants",
      children: [25, 50, 100, 250, 500, 1000].map((capacity) => ({
        name: `${capacity} LPH`, slug: `commercial-ro-${capacity}-lph`,
      })),
    },
    {
      name: "Industrial RO Plants",
      slug: "industrial-ro-plants",
      children: [2000, 3000, 5000, 10000].map((capacity) => ({
        name: `${capacity} LPH`, slug: `industrial-ro-${capacity}-lph`,
      })),
    },
    { name: "Customized RO Plants", slug: "customized-ro-plants" },
    {
      name: "Industrial Equipment",
      slug: "industrial-equipment",
      children: [
        ["FRP Pressure Vessels", "frp-pressure-vessels"],
        ["Multiport Valves", "industrial-multiport-valves"],
        ["Dosing Systems", "dosing-systems"],
        ["Sand Filters", "sand-filters"],
        ["Activated Carbon Filters", "activated-carbon-filters"],
        ["Micron Cartridge Filters", "micron-cartridge-filters"],
        ["Membrane Housings", "industrial-membrane-housings"],
        ["High Pressure Pumps", "high-pressure-pumps"],
        ["Control Panels", "control-panels"],
        ["UV Systems", "industrial-uv-systems"],
        ["Ozonators", "ozonators"],
      ].map(([name, slug]) => ({ name, slug })),
    },
    {
      name: "Plant Accessories",
      slug: "plant-accessories",
      children: [
        ["Flow Meters", "flow-meters"],
        ["Pressure Gauges", "pressure-gauges"],
        ["Conductivity/TDS Meters", "conductivity-tds-meters"],
        ["Dosing Pumps", "dosing-pumps"],
        ["Float Switches", "plant-float-switches"],
        ["Pipes & Fittings", "pipes-fittings"],
      ].map(([name, slug]) => ({ name, slug })),
    },
  ],
  "water-chemicals": [
    {
      name: "RO Chemicals", slug: "ro-chemicals",
      children: [
        ["Antiscalant", "antiscalant"],
        ["Membrane Cleaner (Acidic)", "membrane-cleaner-acidic"],
        ["Membrane Cleaner (Alkaline)", "membrane-cleaner-alkaline"],
        ["Biocide", "ro-biocide"],
        ["Chlorine Tablets", "chlorine-tablets"],
        ["Sodium Hypochlorite", "sodium-hypochlorite"],
      ].map(([name, slug]) => ({ name, slug })),
    },
    {
      name: "Boiler Chemicals", slug: "boiler-chemicals",
      children: [
        ["Oxygen Scavenger", "oxygen-scavenger"],
        ["Scale Inhibitor", "boiler-scale-inhibitor"],
        ["Boiler Treatment Chemicals", "boiler-treatment-chemicals"],
      ].map(([name, slug]) => ({ name, slug })),
    },
    {
      name: "Cooling Tower Chemicals", slug: "cooling-tower-chemicals",
      children: [
        ["Corrosion Inhibitor", "corrosion-inhibitor"],
        ["Scale Inhibitor", "cooling-tower-scale-inhibitor"],
        ["Algaecide", "algaecide"],
        ["Biocide", "cooling-tower-biocide"],
      ].map(([name, slug]) => ({ name, slug })),
    },
    {
      name: "Water Treatment Chemicals", slug: "water-treatment-chemicals",
      children: [
        ["pH Booster", "ph-booster"],
        ["pH Reducer", "ph-reducer"],
        ["Activated Carbon Media", "activated-carbon-media"],
        ["Silica Sand", "silica-sand"],
        ["Resin Cleaner", "resin-cleaner"],
      ].map(([name, slug]) => ({ name, slug })),
    },
  ],
  "stainless-steel-water-coolers": [
    ...[
      ["Wall Mounted Water Coolers", "wall-mounted-water-coolers"],
      ["Floor Standing Water Coolers", "floor-standing-water-coolers"],
      ["Storage Water Coolers", "storage-water-coolers"],
      ["Bottled Water Coolers", "bottled-water-coolers"],
      ["Industrial Water Coolers", "industrial-water-coolers"],
      ["School Water Coolers", "school-water-coolers"],
      ["Railway/Station Water Coolers", "railway-station-water-coolers"],
      ["Water Cooler with RO", "water-cooler-with-ro"],
      ["Water Cooler with Inbuilt Purifier", "water-cooler-inbuilt-purifier"],
    ].map(([name, slug]) => ({ name, slug })),
    {
      name: "Capacity", slug: "water-cooler-capacity",
      children: [20, 40, 60, 80, 120, 150, 200].map((capacity) => ({
        name: `${capacity} L`, slug: `water-cooler-${capacity}-l`,
      })),
    },
  ],
  "water-softeners": [
    {
      name: "Domestic Water Softeners", slug: "domestic-water-softeners",
      children: [
        ["Bathroom Softener", "bathroom-softener"],
        ["Whole House Softener", "whole-house-softener"],
        ["Apartment Softener", "apartment-softener"],
      ].map(([name, slug]) => ({ name, slug })),
    },
    {
      name: "Commercial Water Softeners", slug: "commercial-water-softeners",
      children: ["Hotels", "Restaurants", "Hospitals", "Schools"].map((name) => ({
        name, slug: `commercial-softeners-${name.toLowerCase()}`,
      })),
    },
    {
      name: "Industrial Water Softeners", slug: "industrial-water-softeners",
      children: [
        ["Boiler Feed Softener", "boiler-feed-softener"],
        ["Cooling Tower Softener", "cooling-tower-softener"],
        ["Process Water Softener", "process-water-softener"],
      ].map(([name, slug]) => ({ name, slug })),
    },
    {
      name: "Softener Accessories", slug: "softener-accessories",
      children: [
        ["Ion Exchange Resin", "ion-exchange-resin"],
        ["Brine Tank", "brine-tank"],
        ["Multiport Valve", "softener-multiport-valve"],
        ["FRP Vessel", "softener-frp-vessel"],
        ["Salt Tablets", "salt-tablets"],
      ].map(([name, slug]) => ({ name, slug })),
    },
  ],
  "spare-parts": [
    "Membranes", "Filter Cartridges", "Pumps", "Valves", "Housings", "Connectors",
    "Faucets", "Tubing", "SMPS", "Float Switches",
  ].map((name) => ({ name, slug: `spare-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` })),
  "installation-services": [
    "RO Installation", "AMC (Annual Maintenance Contract)", "RO Repair", "Membrane Replacement",
    "Filter Replacement", "Water Testing", "Plant Commissioning", "Plant Maintenance",
  ].map((name) => ({
    name,
    slug: `service-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
  })),
};

let fallbackCategorySequence = 100;
function appendFallbackBranches(parent: Category, branches: FallbackCategoryBranch[]) {
  branches.forEach((branch, index) => {
    fallbackCategorySequence += 1;
    const category: Category = {
      id: `00000000-0000-4000-8000-${String(fallbackCategorySequence).padStart(12, "0")}`,
      name: branch.name,
      slug: branch.slug,
      description: `${branch.name} category for requirement-led product and quotation enquiries.`,
      imageAlt: `${branch.name} category`,
      parentId: parent.id,
      mediaAssetId: null,
      imageUrl: null,
      imageWidth: null,
      imageHeight: null,
      isActive: true,
      displayOrder: (index + 1) * 10,
      status: "published",
      seoTitle: `${branch.name} | Alpron Aqua Solutions`,
      seoDescription: `Explore the ${branch.name} category from Alpron Aqua Solutions.`,
    };
    fallbackCategories.push(category);
    if (branch.children) appendFallbackBranches(category, branch.children);
  });
}

for (const root of fallbackCategories.slice(0, 7)) {
  appendFallbackBranches(root, fallbackCategoryBranches[root.slug] || []);
}

const fallbackSettings: SiteSettings = {
  brandName: "Alpron Aqua Solutions",
  defaultSeoTitle: "Alpron Aqua Solutions | Water Treatment Solutions",
  defaultSeoDescription:
    "Domestic, commercial and industrial water-treatment categories from Alpron Aqua Solutions.",
  heroTitle: "Complete water treatment solutions for homes, businesses & industry",
  heroDescription:
    "Explore domestic RO systems, commercial and industrial RO plants, water-treatment chemicals, stainless-steel water coolers, water softeners, spare parts and related services.",
  aboutTitle: "A practical catalogue across purification, treatment and system support.",
  aboutSummary:
    "Alpron Aqua Solutions presents domestic, commercial and industrial water-treatment categories through a quotation-led catalogue.",
  whyChooseIntro:
    "The catalogue brings purification systems, treatment equipment, chemicals, components and service requirements into one clear enquiry process.",
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
  ctaTitle: "Looking for the right water treatment solution?",
  ctaDescription:
    "Tell us what you need and the team can help identify an appropriate category and prepare a confirmed quotation.",
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

export const getCategories = cache(async (includeUnpublished = false): Promise<Category[]> => {
  const client = await createServerSupabaseClient();
  if (!client) return fallbackCategories;
  let query = client
    .from("categories")
    .select("*")
    .order("display_order")
    .order("name");
  if (!includeUnpublished) {
    query = query.eq("status", "published").eq("is_active", true);
  }
  const { data, error } = await query;
  if (error || !data) return fallbackCategories;
  const mediaIds = data
    .map((category) => category.media_asset_id)
    .filter((id): id is string => Boolean(id));
  const { data: media } = mediaIds.length
    ? await client
        .from("media_assets")
        .select("id,public_url,width,height,alt_text")
        .in("id", mediaIds)
    : { data: [] };
  const mediaById = new Map((media || []).map((asset) => [asset.id, asset]));
  return data.map((category) => {
    const image = category.media_asset_id
      ? mediaById.get(category.media_asset_id)
      : null;
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageAlt: image?.alt_text || category.image_alt,
      parentId: category.parent_id,
      mediaAssetId: category.media_asset_id,
      imageUrl: image?.public_url || null,
      imageWidth: image?.width || null,
      imageHeight: image?.height || null,
      isActive: category.is_active,
      displayOrder: category.display_order,
      status: category.status,
      seoTitle: category.seo_title,
      seoDescription: category.seo_description,
    };
  });
});

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>(
    categories.map((category) => [category.id, { ...category, children: [] }]),
  );
  const roots: CategoryNode[] = [];
  for (const category of categories) {
    const node = nodes.get(category.id);
    if (!node) continue;
    const parent = category.parentId ? nodes.get(category.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sort = (items: CategoryNode[]) => {
    items.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    items.forEach((item) => sort(item.children));
  };
  sort(roots);
  return roots;
}

export function getCategoryDescendantIds(categories: Category[], categoryId: string) {
  const ids = new Set([categoryId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        changed = true;
      }
    }
  }
  return [...ids];
}

export async function getCategoryBySlug(slug: string, includeUnpublished = false) {
  const categories = await getCategories(includeUnpublished);
  return categories.find((category) => category.slug === slug) || null;
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
    query = query.in("category_id", getCategoryDescendantIds(categories, category.id));
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
