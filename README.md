<div align="center">

<img src="./assets/Logo.png" alt="CipherRoom Logo" width="180"/>

# CipherRoom

**Privacy-First Temporary Collaboration Platform**

Create secure, password-protected rooms for file sharing, real-time messaging, and collaborative notes — automatically deleted after expiration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://cipheroom.app)

[Live Demo](https://cipheroom.app) · [Report Bug](https://github.com/saisuhas12/CipherRoom/issues) · [Request Feature](https://github.com/saisuhas12/CipherRoom/issues)

</div>

---

## Overview

CipherRoom is a secure, temporary workspace built for privacy-conscious collaboration.

Unlike traditional messaging and file-sharing platforms, CipherRoom requires no registration, no email, and no personal information. Users create password-protected rooms, collaborate in real time, and all room data is automatically destroyed after expiration.

The platform is designed around a simple principle:

> **Create. Share. Collaborate. Disappear.**

---

## Screenshots

<!--
  Loading........
-->

---

## Key Features

### Temporary Rooms

* Password-protected private rooms
* Configurable expiration periods (1, 6, or 24 hours)
* Automatic room destruction after expiry
* No data recovery or retention

### Anonymous Access

* No accounts or registration
* No email or phone verification
* Temporary usernames stored locally
* Privacy-focused user experience

### Secure File Sharing & In-Browser Previews

* Drag-and-drop uploads (up to 100MB)
* Browser-side AES-256-GCM encryption before upload
* **In-browser client-side file previews** for images, code/text files, PDFs, audio, and video without saving unencrypted data to disk
* Automatic file deletion on room expiration

### Real-Time Communication & Audit Feed

* Instant messaging with typing indicators
* **In-room Realtime Security Feed** — live activity audit stream tracking room joins, file uploads, downloads, previews, note updates, and deletions
* Collaborative notes with real-time sync & auto-save

### Landing Page & Design

* **Live Global Stats**: Real-time tracked counters (Rooms Created, Files Transferred, Countries Served) with 0ms latency Next.js ISR caching
* **3D Interactive Vault Mesh**: Canvas 2D WebGL background featuring an interactive icosahedron, particle constellation network, and shooting stars
* **On-Demand Username Flow**: Modal triggers only when creating or joining rooms

### Security Features

* Bcrypt password hashing (cost factor 12)
* AES-256-GCM file encryption (client-side, before upload)
* **Right-click & DevTools inspect hotkey prevention** on room pages (`F12`, `Ctrl+Shift+I`, `Ctrl+U`)
* Rate limiting & room lockout after repeated failed attempts
* Content Security Policy (CSP) & CORS origin protection
* Schema.org JSON-LD structured data & canonical SEO optimization

---

## Technology Stack

| Category      | Technology               |
| ------------- | ------------------------- |
| Frontend      | Next.js 16 (App Router, React 19) |
| Language      | TypeScript                |
| Styling       | Tailwind CSS v4           |
| 3D Graphics   | Canvas 2D (Pure 3D Math)  |
| Database      | Supabase PostgreSQL        |
| Realtime      | Supabase Realtime         |
| Storage       | Supabase Storage          |
| Encryption    | Web Crypto API (AES-256-GCM, PBKDF2) |
| Deployment    | Vercel                    |

---

## Architecture

```text
Client Browser (AES-256-GCM Encryption / Decryption)
      │
      ▼
Next.js Server (Proxy CSP / Server Actions / ISR Caching)
      │
      ▼
Supabase Backend
 ├── PostgreSQL (Rooms, Messages, Notes, Files, Global Stats)
 ├── Realtime Engine (Broadcast Channels & Security Audit Feed)
 └── Storage (Encrypted Room Files)
```

All room resources are automatically removed after expiration.

---

## Getting Started

### Prerequisites

Before running the project, ensure you have:

* Node.js 18+
* npm or pnpm
* A Supabase project

### Installation

Clone the repository:

```bash
git clone https://github.com/saisuhas12/CipherRoom.git
cd CipherRoom
```

Install dependencies:

```bash
npm install
```

### Supabase Configuration

1. Create a Supabase project.
2. Open the SQL Editor.
3. Execute the contents of `supabase/schema.sql`.

This creates:

* Database tables (`rooms`, `messages`, `notes`, `files`, `global_stats`, `global_countries`)
* Atomic increment stored procedures (`increment_room_count`, `increment_file_count`)
* Row Level Security policies
* Cleanup functions & Expiration jobs

Create a Storage Bucket named `room-files` with these recommended settings:

* Private Bucket
* Maximum Upload Size: 100MB

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SESSION_SECRET=your_session_secret
CLEANUP_SECRET=your_cleanup_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Security Model

CipherRoom is built with privacy and temporary collaboration in mind.

### Data Lifecycle

```text
Room Created
     │
     ▼
Files • Messages • Notes • Audit Feed
     │
     ▼
Expiration Reached
     │
     ▼
Permanent Deletion
```

### Security Measures

* Passwords are hashed using bcrypt
* File uploads are encrypted client-side (AES-256-GCM) before reaching storage
* File previews are decrypted in client memory only (`URL.revokeObjectURL`)
* In-room security feed provides real-time activity transparency
* Right-click and inspect hotkeys disabled on room pages
* Failed access attempts trigger temporary lockouts
* Security headers & strict CSP enforced via middleware
* Expired rooms are automatically purged, including associated storage objects

---

## Future Improvements

CipherRoom v1.5 ships with room creation, default 1h duration, real-time chat, encrypted file sharing with previews, in-room security feed, live stats, 3D graphics, and auto-expiration built in. Planned next steps:

* End-to-end encrypted messaging and notes (matching the file-encryption model)
* Configurable single-use download limits ("Burn-after-reading" files)
* Progressive Web App (PWA) offline manifest enhancements
* Additional room customization options

---

## Use Cases

* Temporary team collaboration
* Secure document exchange
* Interview file sharing
* Event-based communication rooms
* Privacy-focused messaging
* Cybersecurity project demonstrations

---

## License

This project is licensed under the MIT License.

---

## Disclaimer

CipherRoom is designed for privacy-focused collaboration and temporary data sharing. While strong security practices are implemented, users should independently evaluate whether the platform meets their specific security and compliance requirements before using it for sensitive information.
