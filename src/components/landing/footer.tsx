import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image 
            src="/Logo.png" 
            alt="CipherRoom Logo" 
            width={24} 
            height={24} 
            className="rounded opacity-80"
          />
          <span className="font-mono font-bold text-sm text-foreground tracking-tight">
            CIPHER<span className="text-accent">ROOM</span>
          </span>
          <span className="text-xs text-muted">v1.0</span>
        </div>

        <nav className="flex items-center gap-6">
          <a
            href="#"
            className="text-xs font-mono text-muted hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-xs font-mono text-muted hover:text-foreground transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs font-mono text-muted hover:text-foreground transition-colors"
          >
            About
          </a>
        </nav>

        <p className="text-xs text-muted font-mono">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
