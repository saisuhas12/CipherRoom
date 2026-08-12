import type { NextConfig } from "next";

const securityHeaders = [
  {
    // Prevents MIME-type sniffing — fixes ZAP "X-Content-Type-Options Missing"
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Prevents clickjacking
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Controls referrer information
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Enforces HTTPS
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Restricts browser features
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to ALL routes (catches static assets
        // that the middleware matcher excludes)
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Next.js hashed static assets (JS, CSS) — immutable, long cache
        source: "/_next/static/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Public static assets (images, icons, manifest)
        source: "/(.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|webmanifest))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
