import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Passwords Securely Online (Encrypted & Auto-Delete) | CipherRoom",
  description:
    "Learn the safest way to share passwords, API keys, and credentials online without email or messaging logs. Encrypted, temporary, and self-destructing.",
  alternates: {
    canonical: "https://www.cipheroom.app/share-passwords-securely",
  },
};

export default function SharePasswordsSecurelyPage() {
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
            CREDENTIAL &amp; SECRET SHARING GUIDE
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            How to Share Passwords and API Keys Securely Online
          </h1>
          <p className="mt-2 text-sm text-muted">
            Why sending credentials over email, SMS, or Slack leads to credential stuffing and breaches—and how temporary encrypted workspaces solve it.
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              The Critical Mistake: Sending Passwords via Email and Chat Apps
            </h2>
            <p className="text-muted leading-relaxed">
              Every day, engineers, account managers, and business owners send passwords, root database credentials, payment API keys, and private SSH keys through email threads, Slack direct messages, or WhatsApp groups. This practice creates severe security vulnerabilities:
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-2 font-mono pl-2">
              <li>
                <strong className="text-foreground">Unencrypted Inboxes &amp; Backups:</strong> Standard email travels through intermediate SMTP mail servers in plaintext or opportunistic TLS. Once delivered, emails stay in sent folders, inbox archives, and local client caches forever.
              </li>
              <li>
                <strong className="text-foreground">Slack &amp; Teams Discovery Exposure:</strong> When you share an API token in a workspace channel, that secret is indexed by enterprise search engines, making it accessible to team members who may not need access or exposed during audit discoveries.
              </li>
              <li>
                <strong className="text-foreground">Lack of Automatic Revocation:</strong> Once a secret is written into a chat history, it remains valid until manually rotated. If that account is compromised months later, the historical password is immediately exposed.
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Best Practices for Secure Credential Transmission
            </h2>
            <p className="text-muted leading-relaxed">
              Security standards from NIST, CIS, and OWASP recommend adhering to the following core tenets when passing sensitive authentication material:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-background border border-border rounded space-y-1.5">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  1. Ephemerality (Enforced Expiry)
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Credentials should only be accessible for a limited window of time. Once the recipient acknowledges receipt and imports the secret into their credential vault, the transmission channel must be destroyed.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-1.5">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  2. Two-Channel (Out-of-Band) Delivery
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Never send both the access location and the password in the exact same channel. Send the room link via email or message, and deliver the access password via SMS or voice.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-1.5">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  3. Client-Side Cryptographic Isolation
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  When credentials are stored in files (like .env files, PEM certificates, or JSON service account keys), they must be encrypted before hitting any server.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded space-y-1.5">
                <h3 className="font-mono font-bold text-foreground text-xs uppercase">
                  4. Zero Account Registration
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Avoid tools that force recipients to register accounts or download third-party software, as account credentials themselves become additional attack surfaces.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              How CipherRoom Makes Credential Handoffs Safe
            </h2>
            <p className="text-muted leading-relaxed">
              CipherRoom allows you to spin up a temporary, password-protected collaboration room in seconds without creating an account:
            </p>
            <ol className="list-decimal list-inside text-xs text-muted space-y-2 font-mono pl-2">
              <li>
                <strong className="text-foreground">Create Room:</strong> Set a room name, choose a 1-hour expiration timer, and enter a strong passphrase.
              </li>
              <li>
                <strong className="text-foreground">Upload or Paste Secrets:</strong> If you are sharing a file (such as an SSH key or .env configuration), CipherRoom encrypts it in your browser with AES-256-GCM. If you are sharing text credentials, paste them directly into the collaborative note or live chat.
              </li>
              <li>
                <strong className="text-foreground">Automatic Destruction:</strong> As soon as your recipient copies the credentials into their password manager, or when the 1-hour countdown elapses, the room and all its data are wiped permanently.
              </li>
            </ol>
          </section>

          {/* CTA Box */}
          <div className="p-8 bg-card border-2 border-accent/40 rounded-lg text-center space-y-4">
            <h3 className="text-2xl font-mono font-bold text-foreground tracking-tight">
              Share a Secret or Password Safely
            </h3>
            <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
              Zero registration required. Generate a temporary room, hand off your credentials, and let all records auto-destruct.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-8 py-3.5 bg-accent text-background font-mono font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Create a Secure Room Now →
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
