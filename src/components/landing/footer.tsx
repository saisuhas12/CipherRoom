"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const shareUrl = "https://www.cipheroom.app";
  const shareText =
    "CipherRoom — Temporary encrypted rooms for secure chat & ephemeral file sharing. Zero accounts, client-side AES-256-GCM, auto-destructs completely.";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
      hoverClass: "hover:border-foreground hover:text-foreground hover:bg-foreground/5",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareText)}`,
      hoverClass: "hover:border-[#0088cc] hover:text-[#0088cc] hover:bg-[#0088cc]/10",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareText} ${shareUrl}`
      )}`,
      hoverClass: "hover:border-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.3z" />
        </svg>
      ),
    },
    {
      name: "Reddit",
      url: `https://reddit.com/submit?url=${encodeURIComponent(
        shareUrl
      )}&title=${encodeURIComponent(
        "CipherRoom — Privacy-First Temporary Encrypted Rooms (No Accounts)"
      )}`,
      hoverClass: "hover:border-[#FF4500] hover:text-[#FF4500] hover:bg-[#FF4500]/10",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      hoverClass: "hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10",
      svg: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="border-t border-border px-4 py-8 bg-card/20">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Global Privacy Initiative Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              GLOBAL PRIVACY INITIATIVE
            </div>
            <h3 className="font-mono font-bold text-foreground text-xs sm:text-sm tracking-tight">
              Share CipherRoom Globally
            </h3>
            <p className="text-[11px] text-muted mt-0.5">
              Help expand private, zero-knowledge, account-free communication worldwide.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {shareLinks.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${item.name}`}
                title={`Share on ${item.name}`}
                className={`w-8 h-8 rounded bg-background border border-border text-muted transition-all duration-200 flex items-center justify-center cursor-pointer ${item.hoverClass}`}
              >
                {item.svg}
              </a>
            ))}

            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy CipherRoom Link"
              title="Copy CipherRoom Link"
              className="h-8 px-2.5 rounded bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 font-mono text-[11px] font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Primary Footer Links & Branding */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
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
            <span className="text-xs text-muted font-mono">v1.5.8</span>
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
            <Link
              href="/privnote-alternative"
              className="text-xs font-mono text-muted hover:text-accent transition-colors"
            >
              Guides
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
      </div>
    </footer>
  );
}
