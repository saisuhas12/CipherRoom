# CipherRoom

CipherRoom is a temporary, highly secure, and anonymous collaborative workspace. It's designed for users who need a secure channel to share files, chat, and collaborate on notes without leaving a permanent footprint.

## Features

- **No User Accounts**: No registration, email, or phone number required.
- **Anonymous Identity**: Users claim a username valid for 24 hours (stored in `localStorage`).
- **Temporary Rooms**: Rooms are password-protected and automatically expire (and are deleted) after 1, 6, or 24 hours.
- **End-to-End Encrypted File Sharing**: Files are encrypted in-browser using AES-256-GCM before upload.
- **Realtime Chat**: Instant messaging with typing indicators.
- **Collaborative Notes**: Realtime, synchronized note-taking.
- **Security**: 
  - Rate limiting on sensitive actions.
  - Room lockout after 5 failed password attempts.
  - Strict Content Security Policy (CSP).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL, Realtime, Storage)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Encryption**: Web Crypto API (AES-256-GCM)

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- A Supabase project

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd CipherRoom
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project.
2. Go to the SQL Editor in your Supabase dashboard and run the contents of `supabase/schema.sql` to set up the database schema, tables, functions, and Row Level Security (RLS) policies.
3. Create a storage bucket named `room-files`. Ensure it is set to **private** and adjust the file size limit as needed (e.g., 100MB).

### 3. Environment Variables

Copy the `.env.local.example` file to `.env.local` and populate it with your Supabase project credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Security Considerations

CipherRoom is designed with a strong focus on privacy and security. However, it's crucial to understand the limitations:

- **Client-Side Encryption**: While files are encrypted on the client before reaching the server, the server still facilitates the transfer and storage of encrypted blobs.
- **Local Storage**: Usernames and session keys are stored in the browser's `localStorage`.
- **Ephemeral Data**: All data (rooms, messages, notes, files) is designed to be temporary and is automatically purged upon room expiration. No backups are retained.

## License

This project is licensed under the MIT License.
