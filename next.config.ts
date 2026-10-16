import type { NextConfig } from "next";

const securityHeaders = [
  {
    // Restricts CORS to the primary domain by default (never wildcard '*')
    key: "Access-Control-Allow-Origin",
    value: "https://cipheroom.app",
  },
  {
    // Restrict allowed methods to only what is needed (GET, POST, OPTIONS)
    key: "Access-Control-Allow-Methods",
    value: "GET, POST, OPTIONS",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "Content-Type, Authorization, X-Requested-With",
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
  {
    // Masks web server identity and version from scanners like Wappalyzer
    key: "Server",
    value: "Protected",
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
        // Explicitly prevent edge & browser caching on sensitive room pages
        source: "/room/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Surrogate-Control",
            value: "no-store",
          },
        ],
      },
      {
        // Explicitly prevent caching on API endpoints
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Surrogate-Control",
            value: "no-store",
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
