import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const run = process.env.RUN_SUPABASE_INTEGRATION === "true";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "integration-test-placeholder";
const anonymous = run
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

function getAnonymousClient() {
  if (!anonymous) throw new Error("Supabase integration tests are not enabled.");
  return anonymous;
}

describe.skipIf(!run)("Supabase RLS integration", () => {
  it("allows anonymous reads of published categories", async () => {
    const { data, error } = await getAnonymousClient()
      .from("categories")
      .select("slug,status")
      .eq("status", "published");
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(3);
  });

  it("exposes the approved active category hierarchy", async () => {
    const { data, error } = await getAnonymousClient()
      .from("categories")
      .select("id,slug,parent_id,is_active,status")
      .in("slug", [
        "domestic-ro-systems",
        "commercial-industrial-ro-systems",
        "water-chemicals",
        "stainless-steel-water-coolers",
        "water-softeners",
        "spare-parts",
        "installation-services",
      ]);
    expect(error).toBeNull();
    expect(data).toHaveLength(7);
    expect(data?.every((category) => category.parent_id === null && category.is_active && category.status === "published")).toBe(true);
  });

  it("does not allow anonymous inquiry reads", async () => {
    const { data, error } = await getAnonymousClient().from("inquiries").select("id");
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });

  it("exposes only verified published catalogue records", async () => {
    const { data, error } = await getAnonymousClient()
      .from("products")
      .select("slug,status,verification_status,show_price,price_paise");
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(6);
    expect(data?.every((product) =>
      product.status === "published" &&
      product.verification_status === "verified"
    )).toBe(true);
    expect(data?.every((product) => !product.show_price && product.price_paise === null)).toBe(true);
  });

  it("exposes verified public facts but not private legal research", async () => {
    const { data, error } = await getAnonymousClient()
      .from("business_facts")
      .select("fact_key,verification_status,public_visible");
    expect(error).toBeNull();
    expect(data?.some((fact) => fact.fact_key === "address")).toBe(true);
    expect(data?.some((fact) => fact.fact_key === "gst_number")).toBe(false);
    expect(data?.every((fact) =>
      fact.verification_status === "verified" && fact.public_visible
    )).toBe(true);
  });
});
