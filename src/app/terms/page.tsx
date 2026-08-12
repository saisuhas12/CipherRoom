import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — CipherRoom",
  description:
    "Read the Terms of Service for CipherRoom, the temporary encrypted room platform for ephemeral file sharing and self-destructing chat.",
  alternates: {
    canonical: "https://www.cipheroom.app/terms",
  },
};

export default function TermsPage() {
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
            LEGAL
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs font-mono text-muted">
            Effective Date: August 13, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">01.</span> Acceptance of Terms
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              By accessing or using CipherRoom (&quot;the Service&quot;), available at{" "}
              <a href="https://www.cipheroom.app" className="text-accent hover:underline font-mono">
                www.cipheroom.app
              </a>
              , you agree to be bound by these Terms of Service. If you do not agree to these terms,
              do not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">02.</span> Description of Service
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom provides temporary encrypted rooms for ephemeral file sharing, real-time chat,
              and collaborative notes. Rooms are password-protected, end-to-end encrypted, and automatically
              destroyed after a user-selected expiration period (1 hour, 6 hours, or 24 hours).
            </p>
            <p className="text-muted text-xs leading-relaxed">
              The Service does not require user registration. Display names are stored transiently
              in your local browser storage and are not associated with any account or personal identity.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">03.</span> Acceptable Use
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              You agree to use CipherRoom only for lawful purposes. You may not:
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-1 font-mono pl-2">
              <li>Upload, share, or distribute illegal content, malware, or harmful software.</li>
              <li>Use the Service to harass, threaten, or harm any individual.</li>
              <li>Attempt to circumvent security measures, access other users&apos; rooms without authorization, or reverse-engineer the Service.</li>
              <li>Use the Service for spam, phishing, or fraudulent activities.</li>
              <li>Share content that violates intellectual property rights of others.</li>
            </ul>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom reserves the right to take action against misuse, though our zero-knowledge architecture
              inherently limits our ability to inspect room contents.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">04.</span> Data Handling &amp; Ephemeral Nature
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              All room data (messages, files, notes) is temporary by design and is permanently deleted
              when the room&apos;s expiration timer elapses. CipherRoom does not maintain backups, archives,
              or recovery mechanisms for expired data.
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-1 font-mono pl-2">
              <li>Files are encrypted client-side using AES-256-GCM before upload.</li>
              <li>Room passwords are hashed using bcrypt and never stored in plaintext.</li>
              <li>We cannot recover or restore data from expired or deleted rooms.</li>
              <li>You are responsible for saving any data you need before the room expires.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">05.</span> Limitation of Liability
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              express or implied, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, or non-infringement.
            </p>
            <p className="text-muted text-xs leading-relaxed">
              In no event shall CipherRoom, its creator, or contributors be liable for any indirect,
              incidental, special, consequential, or punitive damages, including but not limited to
              loss of data, arising from or relating to your use of the Service.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">06.</span> Service Availability &amp; File Limits
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              CipherRoom aims for high availability but does not guarantee uninterrupted service.
              We may modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-1 font-mono pl-2">
              <li>Maximum file upload size: 100 MB per file.</li>
              <li>Maximum message length: 5,000 characters.</li>
              <li>Maximum collaborative note length: 50,000 characters.</li>
              <li>Maximum room duration: 24 hours.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">07.</span> Modifications to Terms
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              We reserve the right to update these Terms of Service at any time. Continued use of the
              Service after changes constitutes acceptance of the revised terms. We recommend reviewing
              this page periodically.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <h2 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
              <span className="text-accent font-mono text-base">08.</span> Contact
            </h2>
            <p className="text-muted text-xs leading-relaxed">
              If you have questions about these Terms of Service, please reach out:
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
