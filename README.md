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

### Secure File Sharing

* Drag-and-drop uploads
* Multiple file uploads
* Browser-side AES-256-GCM encryption
* Automatic file deletion on room expiration

### Real-Time Communication

* Instant messaging
* Typing indicators
* Live room activity updates
* Synchronization across connected users

### Collaborative Notes

* Shared workspace notes
* Real-time synchronization
* Auto-save functionality
* Temporary storage lifecycle

### Security Features

* Bcrypt password hashing
* AES-256-GCM file encryption (client-side, before upload)
* Rate limiting
* Room lockout after repeated failed login attempts
* Content Security Policy (CSP)
* Input validation with Zod
* XSS and injection protection

> **Note:** Messages and notes are currently synced via Supabase Realtime (server-side); they are not yet end-to-end encrypted the way file uploads are. See [Future Improvements](#future-improvements) below.

---

## Technology Stack

| Category      | Technology               |
| ------------- | ------------------------- |
| Frontend      | Next.js 16 (App Router)   |
| Language      | TypeScript                |
| Styling       | Tailwind CSS               |
| UI Components | shadcn/ui                  |
| Database      | Supabase PostgreSQL        |
| Realtime      | Supabase Realtime          |
| Storage       | Supabase Storage           |
| Encryption    | Web Crypto API              |
| Deployment    | Vercel                      |

---

## Architecture

```text
Client Browser
      │
      ▼
Next.js Application
      │
      ▼
Supabase Backend
 ├── PostgreSQL
 ├── Realtime Engine
 └── Storage
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

* Database tables
* Row Level Security policies
* Cleanup functions
* Expiration jobs

Create a Storage Bucket named `room-files` with these recommended settings:

* Private Bucket
* Maximum Upload Size: 100MB

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `.env.local` is git-ignored — never commit real keys. Double check with `git log --all --full-history -- .env.local` if you're unsure whether one was ever committed.

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
Files • Messages • Notes
     │
     ▼
Expiration Reached
     │
     ▼
Permanent Deletion
```

### Security Measures

* Passwords are hashed using bcrypt
* File uploads are encrypted client-side (AES-256-GCM) before they reach storage
* Room access is protected by password verification
* Failed access attempts trigger temporary lockouts
* Security headers are enforced via middleware
* Expired rooms are automatically purged, including associated storage objects

---

## Future Improvements

CipherRoom currently ships with room creation, password protection, real-time chat, file sharing, shared notes, and auto-expiration all built in. Planned next steps:

* End-to-end encrypted messaging and notes (matching the file-encryption model)
* File previews
* Enhanced security controls (e.g. configurable view limits, audit logging)
* Progressive Web App (PWA) support
* Activity logs
* Additional collaboration features

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
