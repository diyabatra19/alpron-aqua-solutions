"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.dataset.visible = "true";
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.visible = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
