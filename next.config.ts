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
        // Specifically target Next.js static assets (JS, CSS, fonts)
        // to ensure X-Content-Type-Options is set on woff2/js files
        source: "/_next/static/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
