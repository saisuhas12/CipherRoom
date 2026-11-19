import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Self-Destructing Chat Room — Anonymous & Temporary Messaging | CipherRoom",
  description:
    "Create a self-destructing chat room with zero accounts. Instant real-time messaging, typing indicators, and automatic message purging upon expiration.",
  alternates: {
    canonical: "https://www.cipheroom.app/self-destructing-chat-room",
  },
};

export default function SelfDestructingChatRoomPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20 selection:text-accent font-sans">
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/Logo.png"
              alt="CipherRoom Logo"
              width={28}
              height={28}
              style={{ width: 28, height: 28 }}
              className="rounded opacity-90"
            />
            <span className="font-mono font-bold text-lg text-foreground tracking-tight">
              CIPHE<span className="text-accent">ROOM</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-mono text-muted hover:text-foreground transition-colors flex items-center gap-1 border border-border px-3 py-1.5 rounded hover:border-accent"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-xs mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            EPHEMERAL REAL-TIME MESSAGING
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            Self-Destructing Chat Rooms: Ephemeral Real-Time Communication
          </h1>
          <p className="mt-2 text-sm text-muted">
            How disposable, account-free temporary chat rooms protect sensitive conversations from permanent logs, subpoena exposure, and accidental disclosure.
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Why Permanent Chat History Is a Liability
            </h2>
            <p className="text-muted leading-relaxed">
              Modern team messaging platforms like Slack, Microsoft Teams, WhatsApp, and Discord are designed around infinite searchability. Every joke, offhand speculation, strategic draft, or confidential conversation is permanently archived, indexed by search engines, and attached to user profiles indefinitely.
            </p>
            <p className="text-muted leading-relaxed">
              In professional settings—such as mergers and acquisitions, sensitive HR conversations, whistleblowing disclosures, security incident triage, or legal negotiations—permanent chat archives are not an asset; they represent an ongoing liability. If a third-party service provider suffers a breach or receives a broad discovery order, months or years of historical conversations can be exposed.
            </p>
            <p className="text-muted leading-relaxed">
              A <strong className="text-foreground">self-destructing chat room</strong> fundamentally shifts the paradigm: conversation exists only while active collaboration is occurring. When the objective is achieved, or when the timer elapses, all messages are permanently erased.
            </p>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Core Capabilities of CipherRoom&apos;s Ephemeral Chat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-background border border-border rounded space-y-2">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  1. Zero User Registration
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  No account setup, no email verification, and no phone numbers. Users join by choosing an anonymous handle that lives only in browser storage for 24 hours.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-2">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  2. Strict Expiration Lifecycles
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Rooms are configured for 1 hour, 6 hours, or 24 hours. A real-time visual countdown shows exactly when the room and its message records will be purged.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-2">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  3. Real-Time WebSockets
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Low-latency broadcast communication powered by Supabase Realtime WebSockets delivers instant typing indicators, presence counts, and live message feeds.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-2">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  4. Automated Cascade Deletion
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  When a room expires, foreign key cascade constraints ensure all message rows, files, and notes are irreversibly purged from database tables and cloud storage.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Understanding CipherRoom&apos;s Security &amp; Encryption Model
            </h2>
            <p className="text-muted leading-relaxed">
              We believe in technical transparency and honest security claims. It is important to understand how CipherRoom protects different types of data:
            </p>
            <div className="p-4 bg-background border border-border rounded space-y-3 font-mono text-xs">
              <div>
                <span className="text-accent font-bold">Files (Client-Side E2EE):</span>
                <p className="text-muted mt-0.5">
                  Uploaded files undergo client-side AES-256-GCM encryption in your browser before transfer. The raw file and key never touch our servers.
                </p>
              </div>
              <div>
                <span className="text-accent font-bold">Chat Messages &amp; Notes (Ephemeral &amp; Password-Gated):</span>
                <p className="text-muted mt-0.5">
                  Chat messages and notes are transferred over encrypted HTTPS/WSS (TLS) and stored in our database behind strict bcrypt password gating and HMAC session token verification. They are automatically and permanently destroyed upon room expiration.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              When Should You Use a Self-Destructing Chat Room?
            </h2>
            <ul className="list-disc list-inside text-xs text-muted space-y-2 font-mono pl-2">
              <li>
                <strong className="text-foreground">Cross-Company Vendor Coordination:</strong> Collaborate with external freelancers, contractors, or security researchers without creating guest accounts in your corporate Slack workspace.
              </li>
              <li>
                <strong className="text-foreground">Critical Password or Credential Sharing:</strong> Paste database URLs, API tokens, or server passwords in real-time chat while actively collaborating, knowing the channel will vanish once the call ends.
              </li>
              <li>
                <strong className="text-foreground">Private Personal Conversations:</strong> Discuss sensitive medical, financial, or personal topics without creating permanent conversation logs tied to your personal phone number.
              </li>
            </ul>
          </section>

          {/* CTA Box */}
          <div className="p-8 bg-card border-2 border-accent/40 rounded-lg text-center space-y-4">
            <h3 className="text-2xl font-mono font-bold text-foreground tracking-tight">
              Start a Disposable Chat Room in Seconds
            </h3>
            <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
              No registration, no email, no persistent logs. Create your room, send your invite link and password, and chat with peace of mind.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-8 py-3.5 bg-accent text-background font-mono font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Create a Self-Destructing Chat Room →
              </Link>
            </div>
          </div>

          {/* Internal Links for SEO */}
          <section className="border-t border-border pt-8">
            <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-3">
              Explore Related Privacy Guides
            </h3>
            <div className="flex flex-wrap gap-3 text-xs font-mono">
              <Link href="/privnote-alternative" className="text-accent hover:underline">
                → Privnote Alternative
              </Link>
              <Link href="/send-files-securely-without-account" className="text-accent hover:underline">
                → Send Files Securely Without Account
              </Link>
              <Link href="/share-passwords-securely" className="text-accent hover:underline">
                → Share Passwords Securely
              </Link>
              <Link href="/firefox-send-alternative" className="text-accent hover:underline">
                → Firefox Send Alternative
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
