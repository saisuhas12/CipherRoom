import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CipherRoom — Who Built It & Why",
  description:
    "Learn about CipherRoom, a privacy-first platform for temporary encrypted rooms, ephemeral file sharing, and self-destructing chat. Built by Sai Suhas Sharma.",
  alternates: {
    canonical: "https://www.cipheroom.app/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20 selection:text-accent font-sans">
      {/* Navbar */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/Logo.png"
              alt="CipherRoom Logo"
              width={28}
              height={28}
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

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-xs mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            ABOUT CIPHEROOM
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            About CipherRoom
          </h1>
          <p className="mt-2 text-sm text-muted">
            Why we built a platform for temporary encrypted rooms — and how CipherRoom encryption keeps your data private.
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          {/* Section 1: What is CipherRoom */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">01.</span> What is CipherRoom?
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom is a privacy-first platform that lets you create <strong className="text-foreground">temporary encrypted rooms</strong> for
              secure file sharing, real-time chat, and collaborative notes. Every room is password-protected, end-to-end
              encrypted, and automatically self-destructs after a chosen time (1 hour, 6 hours, or 24 hours).
            </p>
            <p className="text-muted text-xs leading-relaxed">
              There are no accounts, no signups, no email verification. You pick a temporary display name, create a room,
              and share the link. When the timer runs out, everything is permanently destroyed — messages, files, notes, and
              the room itself. Zero recovery. Zero traces.
            </p>
          </section>

          {/* Section 2: Why CipherRoom Exists */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">02.</span> Why CipherRoom Exists
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              Every day, people send sensitive files through email, Slack, Discord, and Google Drive — tools that store
              copies indefinitely, can be subpoenaed, or get breached. There was no simple answer for the question:
              <em className="text-foreground"> &quot;How do I share this file securely, once, and have it disappear?&quot;</em>
            </p>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom was built to be that answer. Whether you need <strong className="text-foreground">ephemeral file sharing</strong> for
              a contract, a <strong className="text-foreground">self-destructing chat</strong> for a private conversation, or a
              quick <strong className="text-foreground">temporary encrypted workspace</strong> for a team handoff — CipherRoom provides
              it without requiring you to create yet another account or trust yet another company with your data.
            </p>
          </section>

          {/* Section 3: How CipherRoom Encryption Works */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">03.</span> How CipherRoom Encryption Works
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom uses <strong className="text-foreground">client-side end-to-end encryption</strong> powered by the Web Crypto API.
              Files are encrypted directly in your browser before they ever leave your device:
            </p>
            <div className="bg-background/80 border border-border/80 p-4 rounded text-xs font-mono text-muted space-y-2">
              <p className="text-accent font-semibold">Encryption Stack:</p>
              <p>• Algorithm: AES-256-GCM — military-grade symmetric encryption</p>
              <p>• Key Derivation: PBKDF2 with 100,000 iterations from the room password</p>
              <p>• Zero Server Knowledge: raw passwords and unencrypted data never reach our servers</p>
              <p>• Room passwords: hashed with bcrypt (cost factor 12) before storage</p>
            </div>
            <p className="text-muted text-xs leading-relaxed">
              This architecture means that even if our servers were compromised, attackers would only find encrypted binary
              payloads they cannot decrypt without the room password — which only exists in participants&apos; browsers.
            </p>
          </section>

          {/* Section 4: Who Built CipherRoom */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">04.</span> Who Built CipherRoom
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom was designed and built by{" "}
              <a
                href="https://saisuhas-one.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-semibold"
              >
                Sai Suhas Sharma
              </a>
              , a developer focused on building privacy-respecting tools. The entire platform — from the encryption layer to
              the real-time collaboration system to the auto-destruction pipeline — was built as a solo project with a single
              goal: <em className="text-foreground">make secure, temporary sharing effortless.</em>
            </p>
          </section>

          {/* Section 5: Contact */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">05.</span> Get in Touch
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              Have questions, found a bug, or want to suggest a feature? We&apos;d love to hear from you.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/contact"
                className="px-4 py-2 bg-accent text-background font-mono text-xs font-bold rounded hover:bg-accent-dim transition-colors"
              >
                Contact Form →
              </Link>
              <a
                href="mailto:saisuhas1212@gmail.com"
                className="text-xs font-mono text-accent hover:underline"
              >
                saisuhas1212@gmail.com
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
