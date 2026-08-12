import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Create a temporary encrypted room or explore CipherRoom.",
};

export default function NotFound() {
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg mx-auto space-y-6">
          {/* Error Code */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-destructive/10 border border-destructive/20 text-destructive font-mono text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            ERROR 404
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-foreground tracking-tight">
            Room Not Found
          </h1>

          {/* Message */}
          <p className="text-sm text-muted leading-relaxed max-w-md mx-auto">
            This page doesn&apos;t exist — it may have self-destructed, or the URL is incorrect.
            CipherRoom pages are temporary by design.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/"
              className="px-6 py-3 bg-accent text-background font-mono font-bold text-sm hover:bg-accent-dim transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              href="/faq"
              className="px-6 py-3 border border-border text-foreground font-mono font-bold text-sm hover:border-accent hover:text-accent transition-colors"
            >
              View FAQ
            </Link>
          </div>

          {/* Decorative terminal line */}
          <div className="pt-8 text-xs font-mono text-muted/40">
            <span className="text-accent/40">$</span> curl https://www.cipheroom.app/... → <span className="text-destructive/60">404</span>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border px-4 py-6">
        <div className="max-w-5xl mx-auto text-center text-xs font-mono text-muted">
          © {new Date().getFullYear()} CipherRoom — Temporary Encrypted Rooms
        </div>
      </footer>
    </div>
  );
}
