<div align="center">

<img src="./assets/Logo.png" alt="CipherRoom Logo" width="160"/>

# CipherRoom

**Privacy-First Temporary Collaboration & Zero-Knowledge File Sharing**

*Create password-protected rooms for ephemeral file transfer, real-time messaging, and shared notes — completely destroyed after expiration.*

[![Live Demo](https://img.shields.io/badge/Demo-cipheroom.app-00FF66?style=for-the-badge&logo=vercel&logoColor=black)](https://cipheroom.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Explore Live Demo](https://cipheroom.app) • [Architecture](#-security-architecture) • [Getting Started](#-getting-started) • [Security Model](#-security-model) • [Contributing](#-contributing)

</div>

---

## ⚡ Overview

**CipherRoom** is an open-source, privacy-first temporary workspace designed for developers, teams, and individuals who require a zero-trace collaboration environment. 

Unlike conventional communication tools that retain permanent chat histories, require personal identity verification, and harvest telemetry, CipherRoom operates on a foundational security principle:

> **Create. Share. Collaborate. Disappear.**

All room assets—messages, collaborative notes, encrypted files, and audit records—exist strictly within a time-bounded lifecycle (**1 hour, 6 hours, or 24 hours**). Once the timer expires, the entire room and its associated data are permanently purged from the database and storage via automated cascade deletion.

---

## ✨ Key Features

### 🛡️ Zero Accounts & Anonymous Identity
- **No Signups or OAuth**: No email, telephone numbers, passwords, or personal credentials required.
- **Local Identity**: Claim an anonymous handle stored strictly in client session memory.
- **Zero Profiling**: No tracking cookies, advertising pixels, or cross-site fingerprinting.

### 🔐 Client-Side AES-256-GCM Encryption
- **Browser-Side Cryptography**: Files are encrypted client-side using the Web Crypto API (`crypto.subtle`) before hitting the wire.
- **Key Derivation**: Room passwords derive cryptographic keys using PBKDF2 (100,000 SHA-256 iterations with a 16-byte random salt).
- **In-Memory Previews**: Images, PDFs, code files, and audio are decrypted on-the-fly in browser memory (`URL.revokeObjectURL`) without ever writing plaintext copies to backend disks.

### ⏱️ Ephemeral Lifecycles & Guaranteed Destruction
- **Configurable Lifespans**: Choose 1 hour, 6 hours, or 24 hours per room.
- **Admin Extension**: Room creators can extend room lifetime in the final 30 minutes before expiration.
- **Automated Destruction**: Scheduled database triggers and edge cleanup jobs permanently purge records and storage blobs.

### 💬 Real-Time Collaboration
- **Instant Encrypted Chat**: WebSockets powered by Supabase Realtime broadcast messages with live typing indicators.
- **Synchronized Notes**: Real-time collaborative notepad with debounced auto-saving.
- **24/7 Global Public Lobby**: Encrypted live public chat preview featuring interactive country flags and geo-presence tags on hover.

### 🎨 Cyber Interface & High Performance
- **Custom Cyber Aesthetic**: Sleek dark terminal theme built with Tailwind CSS v4 and JetBrains Mono.
- **Interactive 3D Canvas Mesh**: Pure 2D Canvas math rendering an interactive geometric wireframe with responsive particle dynamics.
- **Live Global Metrics**: Real-time counters showing total rooms created, files transferred, and countries reached with zero-latency ISR caching.

---

## 🔒 Security Architecture

### Data Flow & Cryptographic Lifecycle

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                                  │
│                                                                        │
│   [ Plaintext File ]  ──────►  [ PBKDF2 Key Derivation ]               │
│                                         │                              │
│                                         ▼                              │
│                                [ AES-256-GCM Cipher ]                  │
│                                         │                              │
│                                         ▼                              │
│                             [ Encrypted Binary Blob ]                  │
└─────────────────────────────────────────┼──────────────────────────────┘
                                          │  HTTPS POST (Encrypted Only)
                                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SERVER & STORAGE LAYER                             │
│                                                                        │
│   Next.js Proxy Middleware (CSP, Strict CORS, CSRF Defense)            │
│            │                                                           │
│            ▼                                                           │
│   Supabase / Storage Bucket (Stores AES-256-GCM Ciphertext)            │
│            │                                                           │
│            ▼                                                           │
│   Automated TTL Expiry ──────► Permanent Cascade Destruction          │
└────────────────────────────────────────────────────────────────────────┘
```

### Defense-in-Depth Protections

| Layer | Implementation | Purpose |
| :--- | :--- | :--- |
| **Transport Security** | HSTS (`max-age=63072000; preload`) | Enforces end-to-end TLS encryption |
| **Content Security** | Strict CSP Header | Mitigates XSS, disallows `unsafe-eval`, restricts script sources |
| **Cross-Origin Defense**| Explicit Domain Whitelist CORS | Replaces wildcard `*` with strict domain validation |
| **CSRF Defense** | Origin vs. Host Header Verification | Rejects unauthorized cross-origin state-mutating requests |
| **Brute-Force Guard** | Sliding-Window IP Rate Limiter | Locks room after repeated failed password attempts |
| **Framework Masking** | Suppressed Fingerprints | Removes `X-Powered-By`, `Server`, and source map disclosures |
| **Client Tamper Defense**| DevTools & Context Inspection Guard | Prevents casual credential harvesting on sensitive room views |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16.4](https://nextjs.org/) (Turbopack, App Router, React 19)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/) with Row Level Security (RLS)
- **Realtime Engine**: Supabase Realtime Channels (WebSockets)
- **File Storage**: Supabase Storage / Cloudflare R2
- **Cryptography**: Web Crypto API (`crypto.subtle` — AES-256-GCM, PBKDF2)
- **Password Security**: `bcryptjs` (Cost factor 12)
- **Validation**: [Zod](https://zod.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.17.0 or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Supabase Account**: A free [Supabase](https://supabase.com) project

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saisuhas12/CipherRoom.git
   cd CipherRoom
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the provided `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and populate the placeholders with your credentials:
   ```env
   # Supabase Credentials (from Project Settings > API)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret

   # Security Secrets (generate via: openssl rand -hex 32)
   SESSION_SECRET=your_32_byte_session_secret
   CLEANUP_SECRET=your_cleanup_bearer_secret

   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

### Database Setup

1. Navigate to your **Supabase Dashboard** > **SQL Editor**.
2. Copy and execute the contents of [`supabase/schema.sql`](supabase/schema.sql).
   This script configures:
   - Database tables: `rooms`, `messages`, `notes`, `files`, `global_stats`, `global_countries`
   - Row Level Security (RLS) enforcement
   - Automated cleanup functions and atomic metric procedures
3. Create a **Storage Bucket**:
   - Bucket Name: `room-files`
   - Visibility: **Private**
   - File Size Limit: **100 MB**

---

### Running Locally

Start the development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Production Build

To verify type safety and generate an optimized production bundle:

```bash
npm run build
npm start
```

---

## 🌐 Deployment

### Deploying to Vercel

The easiest way to deploy CipherRoom is using Vercel:

1. Push your code to your private or public GitHub repository.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Add the environment variables defined in `.env.example` in the **Project Settings > Environment Variables** tab.
4. Deploy. Vercel automatically detects Next.js 16 and sets up edge caching and automated cleanup cron schedules (`vercel.json`).

---

## 📁 Repository Structure

```text
CipherRoom/
├── .env.example              # Sanitized environment configuration template
├── next.config.ts            # Security headers, CSP & asset caching policies
├── vercel.json               # Edge deployment routing & automated cleanup cron
├── package.json              # Dependencies and build scripts
├── supabase/
│   └── schema.sql            # Full PostgreSQL schema, RLS policies & cron
├── public/                   # Static icons, webmanifest & brand graphics
└── src/
    ├── proxy.ts              # Edge middleware: CSP, strict CORS & CSRF guard
    ├── app/                  # Next.js App Router (pages & server actions)
    │   ├── page.tsx          # Landing page with 24/7 public chat & 3D mesh
    │   ├── layout.tsx        # Root layout, typography, metadata & SEO
    │   ├── room/[slug]/      # Password-gated room dashboard (chat, files, notes)
    │   └── api/              # API routes (/cleanup, /contact, /files)
    ├── components/
    │   ├── landing/          # Hero, public chat, interactive 3D vault mesh, stats
    │   └── room/             # Chat, file manager, collaborative notes, timer
    ├── hooks/                # Custom React hooks (presence, geo, auto-scroll)
    └── lib/                  # Utilities: Web Crypto API, logger, Supabase clients
```

---

## 🤝 Contributing

Contributions, feedback, and security reviews are welcome!

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/cyber-enhancement`).
3. Commit your changes (`git commit -m 'feat: add enhanced file burn-after-reading'`).
4. Push to the branch (`git push origin feature/cyber-enhancement`).
5. Open a Pull Request.

---

## 🛡️ Responsible Disclosure

If you discover a potential security vulnerability within CipherRoom, please do not disclose it publicly. Contact the maintainers privately via the [Contact Form](https://cipheroom.app/contact) or open a confidential security advisory on GitHub.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

<div align="center">

<sub>Built for privacy and simplicity. No accounts. No tracking. Complete ephemerality.</sub>

</div>
