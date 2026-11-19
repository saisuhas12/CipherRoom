import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send Files Securely Without an Account (Free & Encrypted) | CipherRoom",
  description:
    "Learn how to send files securely without an account using client-side AES-256-GCM encryption. Auto-delete file sharing with zero signups or phone verification.",
  alternates: {
    canonical: "https://www.cipheroom.app/send-files-securely-without-account",
  },
};

export default function SendFilesSecurelyWithoutAccountPage() {
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
            EPHEMERAL FILE TRANSFER GUIDE
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            How to Send Files Securely Without Creating an Account
          </h1>
          <p className="mt-2 text-sm text-muted">
            A comprehensive guide to account-free, zero-registration file transfers protected by client-side browser cryptography and automatic expiration.
          </p>
        </div>

        <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              The Privacy Problem with Mainstream File Sharing Services
            </h2>
            <p className="text-muted leading-relaxed">
              When most individuals need to send a document, PDF, or archive, the default options typically involve services like Google Drive, Dropbox, OneDrive, or WeTransfer. While convenient, these centralized platforms share several major architectural disadvantages for sensitive communications:
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-2 font-mono pl-2">
              <li>
                <strong className="text-foreground">Mandatory Identity Association:</strong> Most file sharing platforms require either you or your recipient to sign up with an email address, verify a phone number, or authenticate through OAuth, tying your files directly to your real identity.
              </li>
              <li>
                <strong className="text-foreground">Server-Side Key Storage:</strong> While mainstream providers encrypt data &quot;at rest,&quot; they hold the master encryption keys. This means internal employees, automated scanning algorithms, or government subpoenas can access and parse the plaintext contents of your files.
              </li>
              <li>
                <strong className="text-foreground">Indefinite Data Retention:</strong> Files uploaded to cloud drives stay there indefinitely until manually deleted. Even deleted files frequently linger in cloud trash folders, version histories, and secondary offline tape backups for months.
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              How CipherRoom Enables Secure, Account-Free File Transfers
            </h2>
            <p className="text-muted leading-relaxed">
              <strong className="text-foreground">CipherRoom</strong> was engineered specifically to solve the need for temporary, account-free document exchange. By combining client-side encryption with strict auto-destruction lifecycles, users can send up to 100MB files with verified cryptographic security:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-background border border-border rounded">
                <span className="text-accent font-mono font-bold text-lg mb-1 block">01</span>
                <h3 className="font-mono font-bold text-foreground text-xs uppercase mb-1">
                  Client-Side AES-256-GCM
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Before a single byte leaves your browser, your file is encrypted locally using the Web Crypto API. The password you set acts as the root secret to derive a 256-bit AES key.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded">
                <span className="text-accent font-mono font-bold text-lg mb-1 block">02</span>
                <h3 className="font-mono font-bold text-foreground text-xs uppercase mb-1">
                  Zero Account Registration
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  No email address, no phone verification, and no passwords stored in plaintext. You pick a temporary screen handle that exists only in local browser memory.
                </p>
              </div>
              <div className="p-4 bg-background border border-border rounded">
                <span className="text-accent font-mono font-bold text-lg mb-1 block">03</span>
                <h3 className="font-mono font-bold text-foreground text-xs uppercase mb-1">
                  Automated Permanent Purge
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Choose a 1-hour, 6-hour, or 24-hour expiration. Once the countdown expires, database records and encrypted storage binaries are deleted permanently with zero backups.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Direct Storage Architecture: How 100MB Transfers Work
            </h2>
            <p className="text-muted leading-relaxed">
              Many serverless web applications struggle with large file uploads because serverless functions enforce strict 4.5MB request payload ceilings. CipherRoom solves this through a modern <strong className="text-foreground">direct-to-storage presigned upload pipeline</strong>:
            </p>
            <ol className="list-decimal list-inside text-xs text-muted space-y-2 font-mono pl-2">
              <li>
                <strong className="text-foreground">Local Encryption:</strong> The user selects a file. The browser encrypts the raw buffer using AES-256-GCM with a random salt and IV.
              </li>
              <li>
                <strong className="text-foreground">Presigned Upload Authorization:</strong> The browser requests an authorized, short-lived presigned upload token from the server, scoped strictly to the room session.
              </li>
              <li>
                <strong className="text-foreground">Direct Cloudflare R2 Upload:</strong> The encrypted binary payload streams directly from the client browser to encrypted Cloudflare R2 object storage via presigned HTTP PUT, bypassing intermediate proxies.
              </li>
              <li>
                <strong className="text-foreground">Server Verification:</strong> Once the upload completes, the server verifies the file object exists in storage before creating the database metadata entry.
              </li>
            </ol>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-mono font-bold text-foreground">
              Supported Formats &amp; In-Browser Decrypted Previews
            </h2>
            <p className="text-muted leading-relaxed">
              Unlike typical blind storage lockers where users must download an unknown file to inspect it, CipherRoom provides an in-browser decryption modal. Supported file types include:
            </p>
            <ul className="list-disc list-inside text-xs text-muted space-y-1 font-mono pl-2">
              <li>Images: PNG, JPEG, WebP, GIF, SVG</li>
              <li>Documents: PDF, Plain Text, Markdown, CSV</li>
              <li>Code &amp; Configs: JSON, JavaScript, TypeScript, Python, HTML, CSS, YAML</li>
              <li>Archives: ZIP, TAR, GZ (available for instant direct download)</li>
            </ul>
            <p className="text-muted leading-relaxed text-xs">
              When a room participant clicks the preview button, the encrypted bytes are downloaded directly to memory, decrypted using the room password, and displayed safely in an isolated sandbox without writing decrypted files to the server.
            </p>
          </section>

          {/* CTA Box */}
          <div className="p-8 bg-card border-2 border-accent/40 rounded-lg text-center space-y-4">
            <h3 className="text-2xl font-mono font-bold text-foreground tracking-tight">
              Send a Confidential File Right Now
            </h3>
            <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
              Drop your file, set a room password and expiration, and share the link. Encrypted on your machine, auto-purged on expiry.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-8 py-3.5 bg-accent text-background font-mono font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Create Room &amp; Upload Files →
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
