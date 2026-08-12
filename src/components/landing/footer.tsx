import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/Logo.png"
              alt="CipherRoom Logo"
              width={24}
              height={24}
              className="rounded opacity-80"
            />
            <span className="font-mono font-bold text-sm text-foreground tracking-tight">
              CIPHE<span className="text-accent">ROOM</span>
            </span>
          </Link>
          <span className="text-xs text-muted font-mono">v1.5</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/about"
            className="text-xs font-mono text-muted hover:text-accent transition-colors"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-mono text-muted hover:text-accent transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs font-mono text-muted hover:text-accent transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/faq"
            className="text-xs font-mono text-muted hover:text-accent transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            className="text-xs font-mono text-muted hover:text-accent transition-colors"
          >
            Contact Us
          </Link>
          <a
            href="https://saisuhas-one.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-muted hover:text-foreground transition-colors border-l border-border pl-6"
          >
            Developed by Sai Suhas Sharma
          </a>
        </nav>
      </div>
    </footer>
  );
}
