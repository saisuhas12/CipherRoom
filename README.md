
<div align="center">

<img src="./assets/logo.png" alt="CipherRoom Logo" width="180"/>

# CipherRoom

**Privacy-First Temporary Collaboration Platform**

Create secure, password-protected rooms for file sharing, real-time messaging, and collaborative notes — automatically deleted after expiration.

</div>

---

## Overview

CipherRoom is a secure, temporary workspace built for privacy-conscious collaboration.

Unlike traditional messaging and file-sharing platforms, CipherRoom requires no registration, no email, and no personal information. Users create password-protected rooms, collaborate in real time, and all room data is automatically destroyed after expiration.

The platform is designed around a simple principle:

> **Create. Share. Collaborate. Disappear.**

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
* AES-256-GCM file encryption
* Rate limiting
* Room lockout after repeated failed login attempts
* Content Security Policy (CSP)
* Input validation with Zod
* XSS and injection protection

---

## Technology Stack

| Category      | Technology              |
| ------------- | ----------------------- |
| Frontend      | Next.js 16 (App Router) |
| Language      | TypeScript              |
| Styling       | Tailwind CSS            |
| UI Components | shadcn/ui               |
| Database      | Supabase PostgreSQL     |
| Realtime      | Supabase Realtime       |
| Storage       | Supabase Storage        |
| Encryption    | Web Crypto API          |
| Deployment    | Vercel                  |

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

---

### Installation

Clone the repository:

```bash
git clone https://github.com/saisuhas12/cipherroom.git

cd cipherroom
```

Install dependencies:

```bash
npm install
```

---

### Supabase Configuration

1. Create a Supabase project.
2. Open the SQL Editor.
3. Execute the contents of:

```text
supabase/schema.sql
```

This creates:

* Database tables
* Row Level Security policies
* Cleanup functions
* Expiration jobs

Create a Storage Bucket:

```text
room-files
```

Recommended settings:

* Private Bucket
* Maximum Upload Size: 100MB

---

### Environment Variables

Create:

```bash
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

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
* Sensitive uploads are encrypted before storage
* Room access is protected by password verification
* Failed access attempts trigger temporary lockouts
* Security headers are enforced via middleware
* Expired rooms are automatically purged

---

## Roadmap

### Version 1

* Room creation
* Password protection
* Real-time chat
* File sharing
* Shared notes
* Auto-expiration

### Version 2

* End-to-end encrypted messaging
* File previews
* Enhanced security controls

### Version 3

* Progressive Web App (PWA)
* Multiple file uploads
* Activity logs
* Advanced collaboration features

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

### Disclaimer

CipherRoom is designed for privacy-focused collaboration and temporary data sharing. While strong security practices are implemented, users should independently evaluate whether the platform meets their specific security and compliance requirements before using it for sensitive information.
