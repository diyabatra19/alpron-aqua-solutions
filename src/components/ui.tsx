import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
};

const buttonStyles = {
  primary:
    "bg-[#072a47] text-white border-[#072a47] hover:bg-[#0b3a60] hover:border-[#0b3a60]",
  secondary:
    "bg-white text-[#072a47] border-[#bcd0d7] hover:border-[#007d91] hover:text-[#007d91]",
  quiet:
    "bg-[#dff7f8] text-[#06566a] border-transparent hover:bg-[#c9eff1]",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "button-micro inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition",
        buttonStyles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      className={cn(
        "button-micro inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro-aqua relative overflow-hidden border-b border-[#d9e4e8] py-16 sm:py-24">
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="container-shell relative">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="section-title mt-5 max-w-4xl">{title}</h1>
        <p className="body-large mt-6 max-w-3xl">{description}</p>
      </div>
    </section>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
