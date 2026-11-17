# CipherRoom — Comprehensive Technical & Security Audit

> **Scope**: Written Audit covering **Performance**, **SEO**, and **Privacy Claims** analysis for CipherRoom (Next.js 16 App Router on Vercel Free, Supabase Free, Cloudflare R2 Free).  
> **Rule Adherence**: Diagnostic and advisory only; no production application files have been modified.

---

## 2. PERFORMANCE AUDIT

### Problem Statement: Why Desktop Speed Insights scores 67% while Mobile scores 96%
Typically, mobile devices score lower on synthetic tests due to 4x CPU throttling and simulated 4G throttling. When **desktop scores significantly lower than mobile (67% vs 96%)**, it points to desktop-specific runtime execution patterns, viewport-dependent computation, layout dimensions, and main-thread CPU blocking:

1. **VaultMesh Canvas Density Scales With Screen Area**:
   On desktop (e.g. 1920×1080 or 2560×1440), `width * height` is 4x to 8x greater than on mobile (390×844). More particles and vertices calculate connections across a larger render area, causing Total Blocking Time (TBT) and frame drops during synthetic desktop lab measurements.
2. **Left-Docked Desktop `LiveChatPreview` Hydration Overhead**:
   On desktop (>= 1024px), the `PublicChat` is docked open by default, mounting DOM elements, initiating Supabase WebSocket connections, presence tracking, and DOM reconciliation immediately upon hydration, whereas on mobile it renders as a collapsed floating button or minimal layout.
3. **Cumulative Layout Shift (CLS) on Desktop Hero Elements**:
   On desktop, the Hero stats and public chat preview cause layout shifts when font metrics swap (`font-display: swap`) and dynamic asynchronous stat counts resolve.
4. **Main Thread Blocking & Crypto Pre-bundling**:
   Cryptographic and storage libraries are loaded in client component bundles even on the landing page before users initiate an action.

---

### Performance Findings

#### [PERF-01] High Severity — Desktop `PublicChat` Hydration & WebSockets on Landing Page
- **File & Line**: `src/app/page.tsx:85-88`, `src/components/landing/public-chat.tsx:53-125`
- **The Problem**:
  On desktop, the `PublicChat` component opens by default (`isOpen = true`). It immediately:
  1. Calls `getPublicMessages()` via server action on mount.
  2. Opens a Supabase Realtime channel (`room:global-chat`).
  3. Renders a message list, binds scroll listeners, and initiates user presence tracking.
  This introduces significant **Total Blocking Time (TBT)** and delays **Largest Contentful Paint (LCP)** on desktop lab runs because the browser spends critical main-thread cycles parsing messages and managing WebSocket handshakes instead of painting hero typography.
- **Exact Fix**:
  Lazy-load `PublicChat` with `next/dynamic` and defer WebSocket initialization until after first interaction, or keep it collapsed by default on initial page load:
  ```tsx
  // in src/app/page.tsx
  const PublicChat = dynamic(
    () => import("@/components/landing/public-chat").then((m) => m.PublicChat),
    { ssr: false }
  );
  ```

---

#### [PERF-02] High Severity — `VaultMesh` Screen-Area Particle Loop Blocks Desktop Main Thread
- **File & Line**: `src/components/landing/vault-mesh.tsx:131-155`
- **The Problem**:
  `VaultMesh` runs a `requestAnimationFrame` loop that clears and redraws particles, icosahedron wireframes, and linear gradients. On large desktop displays (1080p, 1440p, 4K), `window.devicePixelRatio` combined with high resolutions forces massive canvas buffer redraws every 16ms. This consumes CPU time directly during the initial Page Load / Interaction phase, penalizing desktop TBT.
- **Exact Fix**:
  1. Add an `IntersectionObserver` or disable the animation while the user is actively scrolling or when the hero is out of view.
  2. Cap desktop canvas internal resolution:
  ```ts
  // Clamp DPR to max 1.5 to prevent 4K/Retina canvas render stalls
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ```

---

#### [PERF-03] Medium Severity — Client-Side Font Swapping (`display: swap`) Causing CLS
- **File & Line**: `src/app/layout.tsx:7-17`
- **The Problem**:
  `Inter` and `JetBrains_Mono` are configured with `display: "swap"`. On desktop, where the headline is large (`text-6xl` in `hero.tsx:34`), swapping from the system fallback monospace font to JetBrains Mono causes noticeable horizontal and vertical reflow (CLS) when fonts finish downloading.
- **Exact Fix**:
  Use `adjustFontFallback` (enabled by default in Next.js Google Fonts) and specify `display: "optional"` or tighten CSS fallback metrics so layout dimensions remain stable before and after font load:
  ```ts
  const jetbrains = JetBrains_Mono({
    variable: "--font-jetbrains",
    subsets: ["latin"],
    display: "optional", // Eliminates font-swap layout shift
  });
  ```

---

#### [PERF-04] Medium Severity — Unoptimized Hero Image & Logo Assets
- **File & Line**: `src/components/landing/footer.tsx:152`, `public/Logo.png`
- **The Problem**:
  `Logo.png` is an uncompressed PNG served directly from `/public`. While small, uncompressed assets block HTTP pipelines and contribute to First Contentful Paint delays.
- **Exact Fix**:
  Convert `Logo.png` to WebP/AVIF format or ensure standard `next/image` handles optimization with `priority` when used above the fold.

---

#### [PERF-05] Medium Severity — Unused Cryptographic Libraries Bundled on Landing Page
- **File & Line**: `src/app/page.tsx:8-13`
- **The Problem**:
  `page.tsx` imports `CreateRoomDialog` and `UsernameModal`. `CreateRoomDialog` transitively references password validation and crypto utilities. Users visiting the landing page load scripts required for AES-256 and room creation before clicking "Create Room".
- **Exact Fix**:
  Dynamically import dialogs on user intent (e.g. click "Create Room" / "Join Room"):
  ```tsx
  const CreateRoomDialog = dynamic(
    () => import("@/components/create-room-dialog").then((m) => m.CreateRoomDialog),
    { ssr: false }
  );
  ```

---

## 3. SEO AUDIT

### SEO Health Overview
CipherRoom has foundational SEO elements: a dynamic `sitemap.ts`, `robots.ts`, OpenGraph metadata, and structured JSON-LD schemas (`WebApplication`, `Organization`, `WebSite`, `FAQPage`). However, several key structural, technical, and content gaps limit organic indexing.

---

### SEO Findings

#### [SEO-01] High Severity — Missing Landing Page Server-Rendered Content (`page.tsx` is `"use client"`)
- **File & Line**: `src/app/page.tsx:1`
- **The Problem**:
  The entire root page is marked with `"use client"`. As a result, search crawlers that do not execute complex JavaScript bundles or hit timeout budgets (such as Baidu, DuckDuckGo, older mobile crawlers) receive an empty shell with a spinner (`<div className="w-2 h-2 bg-accent animate-pulse" />` at line 74) before client hydration completes.
- **Exact Fix**:
  Refactor `page.tsx` into a **Server Component** that renders static HTML for `Hero`, `Features`, `HowItWorks`, `UseCases`, and `Footer`. Wrap only interactive overlays (`PublicChat`, `UsernameModal`, dialogs) in client boundaries.

---

#### [SEO-02] Medium Severity — Broken Alternate Hreflang Tags (Declared Languages Without Translated Pages)
- **File & Line**: `src/app/layout.tsx:65-79`
- **The Problem**:
  `layout.tsx` declares `alternates.languages` for 12 languages (`de`, `fr`, `es`, `ja`, `hi`, `pt`, `it`, `ko`, etc.), all pointing to the **exact same English URL** (`https://www.cipheroom.app`). Google Search Console flags this as invalid hreflang markup because pages claiming to be German, French, or Japanese return English content.
- **Exact Fix**:
  Remove `alternates.languages` until dedicated localized routes (e.g. `/de`, `/es`) or localized content exist:
  ```ts
  alternates: {
    canonical: "https://www.cipheroom.app",
    // Remove invalid language mappings pointing to unlocalized URLs
  },
  ```

---

#### [SEO-03] Medium Severity — Heading Hierarchy Inconsistencies
- **File & Line**: `src/components/landing/hero.tsx:34-42`, `src/components/landing/features.tsx:41`, `src/components/landing/use-cases.tsx:47`
- **The Problem**:
  The hero has an `<h1>` containing just `"CIPHEROOM"` with keyword subtitles rendered in a `<p>` tag. On subpages and landing sections, multiple `<h2>` and `<h3>` tags are styled with identical weights, missing contextual semantic grouping.
- **Exact Fix**:
  Include primary search intent in the `<h1>`:
  ```tsx
  <h1 className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-foreground tracking-tighter">
    CIPHE<span className="text-accent">ROOM</span>
    <span className="sr-only"> — Temporary Encrypted Rooms for Secure Chat & Ephemeral File Sharing</span>
  </h1>
  ```

---

#### [SEO-04] Low Severity — `robots.txt` Disallow Path Redundancy
- **File & Line**: `src/app/robots.ts:9`
- **The Problem**:
  `disallow: ["/api/", "/room/"]` correctly blocks room URLs and backend endpoints. However, private query parameters (like invite tokens if ever passed) are not explicitly handled.
- **Exact Fix**:
  Ensure clean disallow patterns:
  ```ts
  rules: [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/room/", "/*?*pwd="],
    },
  ],
  ```

---

### Content Gaps for Search Ranking
To rank for primary search terms (*"ephemeral file sharing"*, *"temporary encrypted room"*, *"disposable chat"*, *"send confidential files free"*), the following pages/content are currently missing:

1. **Dedicated Comparison Pages**:
   - `/vs/privnote` (Why CipherRoom is better than single-note read-once tools).
   - `/vs/wetransfer` (Why client-side encryption and auto-purge beat centralized file lockers).
   - `/vs/wormhole` (Comparison with browser-to-browser P2P tools).
2. **Security Architecture Whitepaper Page**:
   - `/security` or `/architecture` detailing PBKDF2 parameters, AES-256-GCM specs, threat model, and zero-knowledge mathematical guarantees.
3. **Product Blog / Use Case Guides**:
   - Guides explaining *"How to securely share API keys"*, *"How to send signed NDA PDFs without persistent server copies"*.

---

## 4. PRIVACY CLAIMS AUDIT

### Accuracy Verification (Code vs. Marketing Claims)

Below is an itemized comparison of the claims made across `features.tsx`, `use-cases.tsx`, `privacy/page.tsx`, and `faq/page.tsx` against the actual codebase and infrastructure.

---

### Privacy Claim Findings

| # | Exact Site Claim | File & Line | Code Reality | Severity | Risk Assessment |
|---|---|---|---|---|---|
| **PC-01** | *"no server-side logs"* | `features.tsx:29` | `src/lib/logger.ts:25-54` | **HIGH** | Inaccurate: `logSecurityEvent` logs client IP, event type, and timestamps to `console.log` on every action. Vercel runtime collects and stores these logs. |
| **PC-02** | *"no user analytics"* | `features.tsx:29` | `src/app/layout.tsx:293-294` | **HIGH** | Inaccurate: `layout.tsx` mounts `<Analytics />` and `<SpeedInsights />` from `@vercel/analytics` and `@vercel/speed-insights`. |
| **PC-03** | *"no subpoena risk"* | `use-cases.tsx:25` | Infrastructure Reality | **HIGH** | Legally dangerous claim. Serverless hosts (Vercel), database hosts (Supabase), and storage providers (Cloudflare) are subject to court subpoenas and National Security Letters. While ciphertext cannot be decrypted, connection metadata and IP logs can be compelled. |
| **PC-04** | *"zero server-side knowledge of messages"* | `faq/page.tsx:43-52` | `src/lib/actions/messages.ts:47-53` | **HIGH** | Inaccurate: **Files** are encrypted with AES-256-GCM client-side. **Chat messages and notes are NOT client-side encrypted**. They are stored in PostgreSQL in plaintext (sanitized text) and broadcast over WebSockets. |
| **PC-05** | *"zero cookies"* | `use-cases.tsx:37` | `src/lib/auth.ts:72-78` | **MEDIUM** | Inaccurate: Rooms explicitly set HttpOnly session cookies (`room_session_{slug}`) for authorization. |
| **PC-06** | *"No IP addresses recorded"* | Inferred from "No logs" | `src/lib/logger.ts:48`, `rate-limit.ts:77` | **MEDIUM** | IPs are parsed via `getClientIp` and stored in memory for sliding window rate limits, and output into console logs for security events. |

---

### Detailed Findings & Suggested Safe Wording

#### [PC-01] "No Server-Side Logs"
- **Current Text**: *"No tracking cookies, no user analytics, no server-side logs."* (`features.tsx:29`)
- **The Problem**:
  `src/lib/logger.ts` explicitly logs security events (`room_created`, `file_uploaded`, `room_join_failed`) with the client's raw IP address:
  ```ts
  const logEntry: LogEntry = {
    event,
    ip,
    timestamp: new Date().toISOString(),
    details: sanitizedDetails,
  };
  console.log(JSON.stringify(logEntry));
  ```
  On Vercel, stdout from `console.log` is stored in Vercel Function Logs for up to 3 days.
- **Recommended Safe Replacement**:
  > *"Zero persistent activity logs. Security audit events are held only transiently for real-time abuse mitigation and rate limiting."*

---

#### [PC-02] "No User Analytics"
- **Current Text**: *"No tracking cookies, no user analytics, no server-side logs."* (`features.tsx:29`)
- **The Problem**:
  `src/app/layout.tsx` imports and renders:
  ```tsx
  <Analytics />
  <SpeedInsights />
  ```
  These packages collect Web Vitals, page views, and visitor performance metrics. Claiming "no user analytics" while loading `@vercel/analytics` is a direct contradiction.
- **Recommended Safe Replacement**:
  > *"Privacy-preserving performance monitoring. No cross-site advertising trackers, no invasive behavioral profiling, and no third-party data broker SDKs."*

---

#### [PC-03] "No Subpoena Risk"
- **Current Text**: *"No forwarding, no data mining, no subpoena risk."* (`use-cases.tsx:25`)
- **The Problem**:
  No internet service can truthfully promise "no subpoena risk". If served with a legal order, any US-hosted infrastructure (Vercel, Cloudflare, Supabase) must comply. While zero-knowledge encrypted files cannot be decrypted, access metadata, IP connection records, and active rooms can be subpoenaed.
- **Recommended Safe Replacement**:
  > *"Minimized exposure: Once room timers elapse, data is irreversibly purged and cannot be retrieved, recovered, or provided to anyone."*

---

#### [PC-04] Clarify File Encryption vs. Chat/Notes Encryption
- **Current Text**: *"Zero-knowledge architecture... raw passwords and unencrypted data never reach our servers."* (`about/page.tsx:106`, `faq/page.tsx:45`)
- **The Problem**:
  Files are indeed client-side encrypted using AES-256-GCM via `src/lib/crypto.ts`. However, **messages** (`sendMessage` in `messages.ts`) and **notes** (`updateNote` in `notes.ts`) are sent as plaintext UTF-8 over TLS and stored in the database in plaintext. If an attacker gains read access to the database while a room is active, they can read the active room's chat messages.
- **Recommended Safe Replacement**:
  > *"Client-side zero-knowledge file encryption. Uploaded files are encrypted in your browser with AES-256-GCM before transfer. Room messages and notes are password-gated and strictly ephemeral, automatically purged upon room expiry."*  
  *(Or alternatively, implement client-side AES-256 encryption for chat messages and notes as well).*

---

#### [PC-05] "Zero Cookies"
- **Current Text**: *"No phone numbers, zero cookies, zero KYC."* (`use-cases.tsx:37`)
- **The Problem**:
  The app sets `room_session_{slug}` as an HttpOnly session cookie to maintain authenticated access.
- **Recommended Safe Replacement**:
  > *"Zero tracking or third-party cookies. Only technical, cryptographic session cookies are used to authorize room access."*

---

## 5. PRIORITIZED TO-DO LIST

### Phase 1: High Priority (Critical Accuracy & Immediate Desktop Performance)
- [ ] **Fix Privacy Claims**: Update `features.tsx`, `use-cases.tsx`, `about/page.tsx`, and `faq/page.tsx` with honest, legally sound wording (remove "no subpoena risk", "no analytics", clarify that files have client-side E2EE while chat is password-gated ephemeral).
- [ ] **Optimize Desktop Public Chat Hydration**: Dynamically import `PublicChat` on the landing page or default it to collapsed on initial page load so desktop initial render doesn't choke on Supabase Realtime handshakes.
- [ ] **Clamp `VaultMesh` Render Overhead**: Cap canvas DPR to 1.5 and pause the animation loop when the canvas is hidden or off-screen.

### Phase 2: Medium Priority (Core Web Vitals & Technical SEO)
- [ ] **Convert `page.tsx` into a Server Component**: Keep the landing page static HTML for SEO crawlers and delegate interactive popups/modals to dynamic client boundaries.
- [ ] **Fix Hreflang Tags in `layout.tsx`**: Remove multi-language alternates until dedicated localized pages exist.
- [ ] **Eliminate CLS from JetBrains Mono Font**: Set font display to `optional` or tune fallback metrics to stop headline reflows.
- [ ] **Compress Static Images**: Optimize `public/Logo.png` and convert branding assets to modern `.webp` format.

### Phase 3: Long-Term Enhancements (Search Authority & Encryption Parity)
- [ ] **Implement E2EE for Chat & Notes**: Apply the existing AES-256-GCM pipeline to chat payloads and note updates so the entire application truly matches the "Zero-Knowledge" claim.
- [ ] **Publish Comparison Pages**: Build `/vs/privnote`, `/vs/wetransfer`, and `/security` whitepaper to capture high-intent search traffic.

---
*Audit compiled and saved to `AUDIT.md`.*
