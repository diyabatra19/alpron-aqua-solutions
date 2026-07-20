import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6fafc] px-5 py-16">
      <div className="surface-card max-w-xl p-9 text-center sm:p-12">
        <SearchX className="mx-auto size-10 text-[#007d91]" aria-hidden="true" />
        <p className="mt-6 font-mono text-sm text-[#6b7e8a]">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#072a47]">This page is not available.</h1>
        <p className="mt-4 text-sm leading-6 text-[#5b6e7a]">
          The link may be outdated, or a product may not be published yet.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">Return home</ButtonLink>
          <ButtonLink href="/products" variant="secondary">Browse products</ButtonLink>
        </div>
      </div>
    </main>
  );
}
