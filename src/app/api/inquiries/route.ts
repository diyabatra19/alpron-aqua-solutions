import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validation";
import {
  consumeRateLimit,
  getRequestIp,
  isSameOriginRequest,
} from "@/lib/security";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function POST(request: Request) {
  if (!(await isSameOriginRequest(request))) {
    return NextResponse.json({ message: "Request origin was not accepted." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const result = inquirySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0]?.message || "Check the form details." },
      { status: 422 },
    );
  }

  const elapsed = Date.now() - result.data.formStartedAt;
  if (elapsed < 2000 || elapsed > 2 * 60 * 60 * 1000) {
    return NextResponse.json({ message: "Please reload the form and try again." }, { status: 400 });
  }

  const ip = await getRequestIp();
  const permitted = await consumeRateLimit(`inquiry:${ip}`, 5, 15 * 60);
  if (!permitted) {
    return NextResponse.json(
      { message: "Too many enquiries were submitted. Please try again later." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { message: "Enquiry storage is being configured. Please try again later." },
      { status: 503 },
    );
  }

  const client = createServiceRoleClient();
  let productId = result.data.productId;
  if (productId) {
    const { data: product } = await client
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("status", "published")
      .maybeSingle();
    productId = product?.id || null;
  }

  const { error } = await client.from("inquiries").insert({
    customer_name: result.data.customerName,
    phone: result.data.phone,
    email: result.data.email,
    city: result.data.city,
    product_id: productId,
    required_quantity: result.data.requiredQuantity,
    message: result.data.message,
    consent_accepted: true,
    source_page: result.data.sourcePage,
    status: "new",
  });

  if (error) {
    return NextResponse.json(
      { message: "The enquiry could not be recorded. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Enquiry recorded." }, { status: 201 });
}

export function GET() {
  return NextResponse.json({ message: "Method not allowed." }, { status: 405 });
}
