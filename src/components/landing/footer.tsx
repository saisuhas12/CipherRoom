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
            CIPHE<span className="text-accent">ROOM</span>
          </span>
          <span className="text-xs text-muted">v1.5</span>
        </div>

        <nav className="flex items-center gap-7">
          <a
            href="https://saisuhas-one.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="text-xs font-mono text-muted hover:text-foreground transition-colors"
          >
            Developed by Sai Suhas Sharma
          </a>
        </nav>

        <a
          href="#"
          className="text-xs font-mono text-muted hover:text-foreground transition-colors"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
