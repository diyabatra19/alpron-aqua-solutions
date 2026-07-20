import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { BrandMark } from "@/components/site-header";
import { requestPasswordResetAction } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: "Administrator sign in",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#edf5f7] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#d9e4e8] bg-white p-7 shadow-2xl shadow-[#072a47]/10 sm:p-9">
        <BrandMark />
        <div className="mt-9">
          <ShieldCheck className="size-7 text-[#007d91]" aria-hidden="true" />
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#072a47]">Administrator access</h1>
          <p className="mt-3 text-sm leading-6 text-[#5b6e7a]">
            Sign in with an authorized account. This route is not linked from the public website.
          </p>
        </div>
        {params.setup ? (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Supabase credentials are not configured. Follow the README setup before signing in.
          </p>
        ) : null}
        {params.reset === "sent" ? (
          <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            If the account exists, a password reset email has been requested.
          </p>
        ) : null}
        <div className="mt-7"><AdminLoginForm /></div>
        <details className="mt-6 border-t border-[#e1eaed] pt-5">
          <summary className="cursor-pointer text-sm font-semibold text-[#007d91]">Forgot your password?</summary>
          <form action={requestPasswordResetAction} className="mt-4 grid gap-3">
            <div className="field">
              <label htmlFor="reset-email">Administrator email</label>
              <input id="reset-email" name="email" type="email" required autoComplete="email" />
            </div>
            <button className="justify-self-start text-sm font-semibold text-[#072a47] underline underline-offset-4">
              Request reset email
            </button>
          </form>
        </details>
      </section>
    </main>
  );
}
