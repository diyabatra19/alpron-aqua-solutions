import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: settings.defaultSeoTitle,
      template: `%s | ${settings.brandName}`,
    },
    description: settings.defaultSeoDescription,
    applicationName: settings.brandName,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: settings.brandName,
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDescription,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#072a47",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
