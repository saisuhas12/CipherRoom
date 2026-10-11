import type { NextConfig } from "next";

const securityHeaders = [
  {
    // Restricts CORS to the primary domain by default (never wildcard '*')
    key: "Access-Control-Allow-Origin",
    value: "https://cipheroom.app",
  },
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
  // Hide "X-Powered-By: Next.js" header from scanners and browser extensions
  poweredByHeader: false,

  // Disallow exposing original TypeScript source maps in production client bundles
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        // Apply security headers to ALL routes
        source: "/:path*",
        headers: securityHeaders,
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
