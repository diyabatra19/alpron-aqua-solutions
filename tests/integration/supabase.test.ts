import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const run = process.env.RUN_SUPABASE_INTEGRATION === "true";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "integration-test-placeholder";

describe.skipIf(!run)("Supabase RLS integration", () => {
  const anonymous = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  it("allows anonymous reads of published categories", async () => {
    const { data, error } = await anonymous
      .from("categories")
      .select("slug,status")
      .eq("status", "published");
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(3);
  });

  it("does not allow anonymous inquiry reads", async () => {
    const { data, error } = await anonymous.from("inquiries").select("id");
    expect(data).toEqual([]);
    expect(error).toBeNull();
  });

  it("exposes only verified published catalogue records", async () => {
    const { data, error } = await anonymous
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
    const { data, error } = await anonymous
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
