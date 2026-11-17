import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Firefox Send Alternative — Encrypted Ephemeral File Transfers | CipherRoom",
  description:
    "Searching for a Firefox Send replacement? CipherRoom provides client-side AES-256-GCM file encryption, zero accounts, and auto-delete file transfers.",
  alternates: {
    canonical: "https://www.cipheroom.app/firefox-send-alternative",
  },
};

export default function FirefoxSendAlternativePage() {
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
            FIREFOX SEND SUCCESSOR
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            The Modern Firefox Send Alternative for Encrypted File Transfers
          </h1>
          <p className="mt-2 text-sm text-muted">
            Mozilla retired Firefox Send in 2020. Here is how CipherRoom delivers client-side AES-256-GCM encryption, auto-deletion, and zero-account sharing.
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              What Was Firefox Send and Why Did Mozilla Shut It Down?
            </h2>
            <p className="text-muted leading-relaxed">
              When Mozilla launched <strong className="text-foreground">Firefox Send</strong>, it quickly became the gold standard for secure file delivery. It implemented client-side encryption directly in the browser, allowed users to send files up to 2.5GB without accounts, and allowed links to expire after a certain number of downloads or a set duration.
            </p>
            <p className="text-muted leading-relaxed">
              Unfortunately, in late 2020, Mozilla discontinued the service permanently. Malicious actors began abusing the unauthenticated, anonymous platform to distribute malware and phishing payloads, and Mozilla lacked the resources to build effective abuse-mitigation systems without compromising the zero-knowledge nature of the tool.
            </p>
            <p className="text-muted leading-relaxed">
              Ever since its shutdown, privacy advocates, developers, and security professionals have searched for a clean, privacy-focused replacement that provides browser-based client-side encryption without forcing users into subscriptions or bloated enterprise software.
            </p>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              How CipherRoom Serves as the Ideal Modern Alternative
            </h2>
            <p className="text-muted leading-relaxed">
              <strong className="text-foreground">CipherRoom</strong> builds on the core philosophical promises of Firefox Send while evolving the model into a full collaborative temporary workspace:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-background border border-border rounded space-y-2">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  Client-Side AES-256-GCM
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Like Firefox Send, files uploaded to CipherRoom are encrypted directly inside your browser memory using the Web Crypto API. The server only receives encrypted binary blobs and has no access to the decryption keys.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-2">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  Zero Registration Required
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  No signups, no email addresses, and no phone verification. Anyone can generate an encrypted room and share the link immediately.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-2">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  Integrated Room Collaboration
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  While Firefox Send was purely a file-pipe, CipherRoom combines client-side encrypted file transfers with real-time ephemeral chat and collaborative markdown notes.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-2">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  Guaranteed Auto-Destruction
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Every room has an immutable lifetime of 1 hour, 6 hours, or 24 hours. When the countdown completes, files and database rows are purged permanently.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Feature Matrix: Firefox Send vs. CipherRoom
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse border border-border">
                <thead>
                  <tr className="bg-background/80 text-left">
                    <th className="p-3 border border-border text-foreground">Capability</th>
                    <th className="p-3 border border-border text-accent">CipherRoom</th>
                    <th className="p-3 border border-border text-muted">Firefox Send (Legacy)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted">
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">Service Status</td>
                    <td className="p-3 border border-border text-accent">Active &amp; Maintained</td>
                    <td className="p-3 border border-border text-red-400">Discontinued (2020)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">Encryption Engine</td>
                    <td className="p-3 border border-border">Client-Side AES-256-GCM + PBKDF2</td>
                    <td className="p-3 border border-border">Client-Side AES-128-GCM</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">Account Requirements</td>
                    <td className="p-3 border border-border">Zero accounts (100% anonymous)</td>
                    <td className="p-3 border border-border">Optional Firefox Account</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">In-Browser File Previews</td>
                    <td className="p-3 border border-border">Decrypted preview for PDF, images, code</td>
                    <td className="p-3 border border-border">Download only (no preview)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">Live Communication</td>
                    <td className="p-3 border border-border">Real-time ephemeral chat + notes</td>
                    <td className="p-3 border border-border">None (file transfer only)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Abuse Mitigation Without Breaking Privacy
            </h2>
            <p className="text-muted leading-relaxed">
              To prevent the malware distribution issues that forced Firefox Send to shut down, CipherRoom employs layered rate limiting, brute-force lockout thresholds, strict MIME-type sanitization, and automated room expiration lifecycles. This keeps the service free and open worldwide without collecting personal information or compromising client-side encryption.
            </p>
          </section>

          {/* CTA Box */}
          <div className="p-8 bg-card border-2 border-accent/40 rounded-lg text-center space-y-4">
            <h3 className="text-2xl font-mono font-bold text-foreground tracking-tight">
              Ready to Send Files Securely?
            </h3>
            <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
              No accounts. No software downloads. Encrypt files in your browser and share them with an automatic destruction timer.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-8 py-3.5 bg-accent text-background font-mono font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Create an Encrypted Room Now →
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
              <Link href="/self-destructing-chat-room" className="text-accent hover:underline">
                → Self-Destructing Chat Room
              </Link>
              <Link href="/share-passwords-securely" className="text-accent hover:underline">
                → Share Passwords Securely
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
