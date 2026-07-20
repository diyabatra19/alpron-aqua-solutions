"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui";

type FormState = { status: "idle" | "submitting" | "success" | "error"; message?: string };

export function InquiryForm({
  productId = "",
  productName,
  sourcePage,
  products = [],
}: {
  productId?: string;
  productName?: string;
  sourcePage: string;
  products?: Array<{ id: string; name: string }>;
}) {
  const startedAtInput = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<FormState>({ status: "idle" });

  useEffect(() => {
    if (startedAtInput.current) {
      startedAtInput.current.value = String(Date.now());
    }
  }, []);

  async function submit(formData: FormData) {
    setState({ status: "submitting" });
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Unable to submit your enquiry.");
      setState({
        status: "success",
        message: "Thank you. Your enquiry has been recorded for follow-up.",
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to submit your enquiry.",
      });
    }
  }

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900" role="status">
        <CheckCircle2 className="size-7" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-bold">Enquiry received</h2>
        <p className="mt-2 text-sm leading-6">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={submit} className="grid gap-5" noValidate>
      {productName ? (
        <div className="rounded-xl border border-[#b9dfe3] bg-[#effbfb] p-4 text-sm text-[#07586a]">
          Enquiring about <strong>{productName}</strong>
        </div>
      ) : null}
      {productName ? (
        <input type="hidden" name="productId" value={productId} />
      ) : (
        <div className="field">
          <label htmlFor={`product-${sourcePage}`}>Product <span className="font-normal text-[#6b7e8a]">(optional)</span></label>
          <select id={`product-${sourcePage}`} name="productId" defaultValue={productId}>
            <option value="">General quotation / not sure yet</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
      )}
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <input ref={startedAtInput} type="hidden" name="formStartedAt" defaultValue="0" />
      <div className="pointer-events-none absolute -left-[10000px]" aria-hidden="true">
        <label htmlFor={`website-${sourcePage}`}>Website</label>
        <input id={`website-${sourcePage}`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor={`name-${sourcePage}`}>Customer name *</label>
          <input id={`name-${sourcePage}`} name="customerName" required minLength={2} maxLength={100} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor={`phone-${sourcePage}`}>Phone number *</label>
          <input id={`phone-${sourcePage}`} name="phone" required minLength={7} maxLength={20} inputMode="tel" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor={`email-${sourcePage}`}>Email <span className="font-normal text-[#6b7e8a]">(optional)</span></label>
          <input id={`email-${sourcePage}`} name="email" type="email" maxLength={254} autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor={`city-${sourcePage}`}>City *</label>
          <input id={`city-${sourcePage}`} name="city" required minLength={2} maxLength={100} autoComplete="address-level2" />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`quantity-${sourcePage}`}>Required quantity *</label>
        <input id={`quantity-${sourcePage}`} name="requiredQuantity" required maxLength={80} placeholder="For example: 10 units" />
      </div>
      <div className="field">
        <label htmlFor={`message-${sourcePage}`}>How can we help? *</label>
        <textarea id={`message-${sourcePage}`} name="message" required minLength={10} maxLength={2000} rows={5} placeholder="Share the intended use and any requirements you would like confirmed." />
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-[#425563]">
        <input type="checkbox" name="consent" required className="mt-1 size-4 accent-[#007d91]" />
        <span>
          I consent to Alpron Aqua Solutions using these details to respond to my enquiry. See the{" "}
          <Link href="/privacy-policy" className="font-semibold text-[#007d91] underline underline-offset-2">
            privacy policy
          </Link>.
        </span>
      </label>
      {state.status === "error" ? (
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" className="justify-self-start" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
        {state.status === "submitting" ? "Submitting…" : "Submit enquiry"}
      </Button>
    </form>
  );
}
