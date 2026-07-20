import type { Metadata } from "next";
import { completePasswordResetAction } from "@/app/admin/login/actions";
import { BrandMark } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Reset administrator password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#edf5f7] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#d9e4e8] bg-white p-8 shadow-xl">
        <BrandMark />
        <h1 className="mt-9 text-3xl font-bold tracking-tight text-[#072a47]">Set a new password</h1>
        <p className="mt-3 text-sm leading-6 text-[#5b6e7a]">Use at least 12 characters with uppercase, lowercase, number and symbol.</p>
        <form action={completePasswordResetAction} className="mt-7 grid gap-5">
          <div className="field"><label htmlFor="reset-new-password">New password</label><input id="reset-new-password" name="newPassword" type="password" required minLength={12} autoComplete="new-password" /></div>
          <div className="field"><label htmlFor="reset-confirm-password">Confirm new password</label><input id="reset-confirm-password" name="confirmPassword" type="password" required minLength={12} autoComplete="new-password" /></div>
          <button className="min-h-11 rounded-full bg-[#072a47] px-5 text-sm font-semibold text-white">Update password</button>
        </form>
      </section>
    </main>
  );
}
