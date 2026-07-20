import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/product-media/**",
      },
    ],
  },
  async headers() {
    const scriptSources =
      process.env.NODE_ENV === "development"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'";
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "object-src 'none'",
          "frame-src 'self' https://www.google.com https://maps.google.com",
          "img-src 'self' data: blob: https://*.supabase.co",
          "font-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          scriptSources,
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "no-store, private" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
