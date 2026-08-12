import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CipherRoom",
  description: "Learn about CipherRoom's privacy-first, zero-knowledge architecture, client-side encryption, and automatic room destruction policy.",
  alternates: {
    canonical: "https://www.cipheroom.app/privacy",
  },
};

export default function PrivacyPage() {
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
            ZERO KNOWLEDGE · PRIVACY FIRST
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs font-mono text-muted">
            Effective Date: August 11, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">01.</span> Core Philosophy: Zero Registration
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom is designed from the ground up to operate without collecting personal identity data.
              We do not ask for or store email addresses, passwords, phone numbers, real names, or social logins to create or join collaboration rooms.
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-1 font-mono pl-2">
              <li>No user account registration or login required.</li>
              <li>Usernames exist only transiently in your local browser storage (`localStorage`).</li>
              <li>Usernames expire automatically after 24 hours of inactivity.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">02.</span> Temporary Data & Auto-Destruction
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              Every room created on CipherRoom has a strictly enforced expiration timer (1 hour, 6 hours, or 24 hours).
              When a room reaches its expiration timestamp:
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-1 font-mono pl-2">
              <li>All chat messages sent within the room are permanently deleted.</li>
              <li>All collaborative notes are purged from the database.</li>
              <li>All uploaded files are permanently deleted from object storage.</li>
              <li>The room record itself is deleted with database cascade isolation.</li>
              <li>No backups or archives of expired room data are retained.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">03.</span> Client-Side End-to-End File Encryption
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              Files shared in CipherRoom undergo client-side encryption using the Web Crypto API before being transmitted to our servers:
            </p>
            <div className="bg-background/80 border border-border/80 p-4 rounded text-xs font-mono text-muted space-y-2">
              <p className="text-accent font-semibold">Technical Implementation:</p>
              <p>• Algorithm: AES-256-GCM encryption with PBKDF2 key derivation (100,000 iterations).</p>
              <p>• Encryption Key: Derived directly in your browser using the room password.</p>
              <p>• Zero Server Knowledge: Raw room passwords and unencrypted files never reach our servers.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">04.</span> Cookies & Local Storage
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom uses minimal storage strictly required for technical operation:
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-1 font-mono pl-2">
              <li>
                <strong className="text-foreground">Session Cookies:</strong> Temporary HMAC-signed HttpOnly cookies to authorize active room sessions during your visit.
              </li>
              <li>
                <strong className="text-foreground">Local Storage:</strong> Stores your display name locally in your browser for convenience.
              </li>
              <li>
                <strong className="text-foreground">No Advertising Cookies:</strong> We do not use third-party tracking or advertising cookies.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">05.</span> Contact & Inquiries
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or CipherRoom's privacy protections, please contact us at:
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
