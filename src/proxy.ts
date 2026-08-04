import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Proxy — Security Headers & CSP
 *
 * Sets all required security response headers and provides CSRF
 * protection for mutating requests.
 *
 * Fixes the following OWASP ZAP findings:
 * - CSP: script-src unsafe-eval          → removed in production
 * - CSP: script-src unsafe-inline        → required by Next.js (framework limitation)
 * - CSP: style-src unsafe-inline         → required by Next.js/Tailwind (framework limitation)
 * - CSP: Failure to define directive     → added form-action, object-src, base-uri
 * - Cross-Domain Misconfiguration        → explicit CORS origin whitelist
 * - X-Content-Type-Options Missing       → nosniff on all responses
 * - Re-examine Cache-control Directives  → no-store on dynamic pages
 */

const isDev = process.env.NODE_ENV === "development";

// Trusted origins for CORS
const ALLOWED_ORIGINS = new Set([
  "https://www.cipheroom.app",
  "https://cipheroom.app",
  "https://cipheroom.vercel.app",
]);

export function proxy(request: NextRequest) {
  // Build Content-Security-Policy
  // NOTE: 'unsafe-inline' is required because Next.js injects inline scripts
  // for hydration that cannot be nonced without framework-level support.
  // 'unsafe-eval' is removed in production (not needed by Next.js in prod).
  const cspDirectives: string[] = [];

  if (isDev) {
    // Development: permissive CSP to allow HMR, eval, dev tools, and analytics
    cspDirectives.push(
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* http://localhost:* https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "object-src 'none'",
      "base-uri 'self'",
    );
  } else {
    // Production: strict CSP — no unsafe-eval, no nonce
    // (nonce would cause browsers to ignore 'unsafe-inline' per CSP Level 2,
    //  breaking Next.js inline scripts that aren't nonced by the framework)
    cspDirectives.push(
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "upgrade-insecure-requests",
    );
  }

  const cspHeader = cspDirectives.join("; ");

  const response = NextResponse.next();

  // ── Content Security Policy ──────────────────────────────────────
  response.headers.set("Content-Security-Policy", cspHeader);

  // ── Standard Security Headers ────────────────────────────────────
  // Prevents MIME-type sniffing (fixes ZAP Low finding)
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevents clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Controls referrer information sent with requests
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enforces HTTPS for 2 years with preload eligibility
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Restricts browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Prevents DNS prefetching to reduce privacy leaks
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // ── Cache Control for Dynamic Pages ──────────────────────────────
  // Only set no-store for HTML page requests (not static assets or API)
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  // ── CORS ─────────────────────────────────────────────────────────
  // Fixes ZAP Cross-Domain Misconfiguration by whitelisting origins
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
    response.headers.set("Vary", "Origin");
  }

  // ── CSRF Protection ──────────────────────────────────────────────
  // Block cross-origin mutating requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse("Forbidden", { status: 403 });
        }
      } catch {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico and common static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};

