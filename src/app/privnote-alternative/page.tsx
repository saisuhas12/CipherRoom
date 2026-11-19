import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privnote Alternative — Encrypted Notes, Chat & Files (No Accounts) | CipherRoom",
  description:
    "Looking for a secure Privnote alternative? CipherRoom offers client-side encrypted notes, ephemeral file sharing, and self-destructing rooms with zero signups.",
  alternates: {
    canonical: "https://www.cipheroom.app/privnote-alternative",
  },
};

export default function PrivnoteAlternativePage() {
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
            SECURE NOTE &amp; WORKSPACE SHARING
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            The Modern Privnote Alternative for Encrypted Temporary Collaboration
          </h1>
          <p className="mt-2 text-sm text-muted">
            Why privacy-focused professionals and security-conscious teams choose CipherRoom over traditional read-once note pastebins.
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Beyond Single-Read Text: Why Privnote Needs an Upgrade
            </h2>
            <p className="text-muted leading-relaxed">
              For over a decade, <strong className="text-foreground">Privnote</strong> has been a widely recognized utility for sending single-use self-destructing text notes. While sending a one-time link that vanishes upon opening solved a basic privacy problem, modern communication workflows demand far more versatility, verifiable client-side cryptographic guarantees, and collaborative capability.
            </p>
            <p className="text-muted leading-relaxed">
              When working with colleagues, freelancers, clients, or remote team members, sensitive collaboration rarely consists of a single static line of text. You need to review an encrypted confidential contract, exchange temporary credentials while debugging an incident, and converse in real time. Single-read note services fail here because the moment a recipient opens the note, it disappears—leaving no opportunity for back-and-forth exchange or file inspection.
            </p>
            <p className="text-muted leading-relaxed">
              <strong className="text-foreground">CipherRoom</strong> was built as an advanced, zero-registration alternative. Instead of a fragile, single-read pastebin, CipherRoom provides a temporary encrypted room equipped with live chat, client-side encrypted file transfers up to 100MB, and a synchronized collaborative notepad—all bound to an automated room destruction timer (1h, 6h, or 24h).
            </p>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Technical Comparison: CipherRoom vs. Traditional Note Pastebins
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse border border-border">
                <thead>
                  <tr className="bg-background/80 text-left">
                    <th className="p-3 border border-border text-foreground">Feature</th>
                    <th className="p-3 border border-border text-accent">CipherRoom</th>
                    <th className="p-3 border border-border text-muted">Privnote &amp; Legacy Pastebins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted">
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">Registration / Accounts</td>
                    <td className="p-3 border border-border text-accent">Zero Accounts Required</td>
                    <td className="p-3 border border-border">Zero Accounts Required</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">Collaboration Scope</td>
                    <td className="p-3 border border-border">Full Room: Chat + Files + Notes</td>
                    <td className="p-3 border border-border">Single static text snippet</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">File Sharing</td>
                    <td className="p-3 border border-border">Client-Side AES-256-GCM (Up to 100MB)</td>
                    <td className="p-3 border border-border">None or severely restricted</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">In-Browser Decryption</td>
                    <td className="p-3 border border-border">Interactive previews (PDF, images, code)</td>
                    <td className="p-3 border border-border">Text only</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-border text-foreground font-semibold">Data Destruction</td>
                    <td className="p-3 border border-border">Automated Cascade Purge on Expiry</td>
                    <td className="p-3 border border-border">Read-once or manual destroy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Client-Side Cryptography: How Your Secrets Stay Protected
            </h2>
            <p className="text-muted leading-relaxed">
              When transferring documents or sensitive credentials, trust should be verified through mathematics rather than corporate promises. CipherRoom implements client-side encryption using the standards-compliant <strong className="text-foreground">Web Crypto API</strong> native to modern web browsers:
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-2 font-mono pl-2">
              <li>
                <strong className="text-foreground">AES-256-GCM Encryption:</strong> Files uploaded to the room are encrypted locally in your browser memory before any network packet leaves your machine.
              </li>
              <li>
                <strong className="text-foreground">PBKDF2 Key Derivation:</strong> The encryption key is derived using 100,000 iterations of SHA-256 with a cryptographically randomized 16-byte salt, based strictly on the room password you set.
              </li>
              <li>
                <strong className="text-foreground">Zero Server Knowledge of Files:</strong> The server receives and stores only scrambled ciphertext. Because the room password is never stored in raw plaintext (only hashed via bcrypt with cost factor 12 for room gating), the server has no capability to decrypt the stored binary payloads.
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Common Use Cases for an Upgraded Privnote Alternative
            </h2>
            <p className="text-muted leading-relaxed">
              CipherRoom is designed for situations where traditional email, Slack, Discord, or standard cloud storage expose you to unnecessary audit trails, inadvertent indexing, or persistent server retention:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-background border border-border rounded">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase mb-1">
                  Incident Response &amp; Credential Handoffs
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  DevOps and security teams can exchange rotating database passwords, SSH keys, or cloud environment variables. Chat and notes persist for the duration of the incident call, and permanently purge when the room expires.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase mb-1">
                  Confidential Document Reviews
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Send financial sheets, tax forms, or confidential contracts with client-side encryption. Participants can preview PDFs and images directly inside the browser without leaving temporary artifacts on intermediate servers.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Box */}
          <div className="p-8 bg-card border-2 border-accent/40 rounded-lg text-center space-y-4">
            <h3 className="text-2xl font-mono font-bold text-foreground tracking-tight">
              Ready to Share Securely Without an Account?
            </h3>
            <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
              Create a temporary encrypted room in under 5 seconds. Pick an expiration duration, set a password, and collaborate with zero trace left behind.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-8 py-3.5 bg-accent text-background font-mono font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Create a Temporary Room Now →
              </Link>
            </div>
          </div>

          {/* Internal Links for SEO */}
          <section className="border-t border-border pt-8">
            <h3 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-3">
              Explore Related Privacy Guides
            </h3>
            <div className="flex flex-wrap gap-3 text-xs font-mono">
              <Link href="/send-files-securely-without-account" className="text-accent hover:underline">
                → Send Files Securely Without Account
              </Link>
              <Link href="/self-destructing-chat-room" className="text-accent hover:underline">
                → Self-Destructing Chat Room
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
