import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";
import { FAQAccordion } from "@/components/landing/faq-accordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — CipherRoom Encryption, Temp Chats & Ephemeral File Sharing",
  description:
    "Frequently asked questions about CipherRoom: how encryption works, how long temp chats last, ephemeral file sharing, self-destructing chat, and zero-knowledge architecture.",
  alternates: {
    canonical: "https://www.cipheroom.app/faq",
  },
};

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: "General",
    question: "What is CipherRoom?",
    answer:
      "CipherRoom is a privacy-first, zero-registration platform for creating temporary encrypted rooms. It allows people to create password-protected rooms to exchange real-time messages, share files with ephemeral file sharing, and collaborate on notes — all without making an account. Everything auto-deletes when the room expires.",
  },
  {
    category: "General",
    question: "Do I need to sign up or create an account?",
    answer:
      "No. CipherRoom requires zero accounts, emails, or passwords. You pick a temporary display username stored locally in your browser, and you can immediately create or join rooms.",
  },
  {
    category: "Security",
    question: "How does CipherRoom encryption work?",
    answer:
      "CipherRoom encryption uses the Web Crypto API to encrypt files entirely in your browser before upload. The encryption algorithm is AES-256-GCM with PBKDF2 key derivation (100,000 iterations), using the room password as the encryption key. This means CipherRoom servers only ever store encrypted binary payloads — we never see your raw files or the room password in plaintext.",
  },
  {
    category: "Security",
    question: "Is CipherRoom really zero-knowledge?",
    answer:
      "Yes. CipherRoom is built on zero-knowledge architecture. Room passwords are hashed with bcrypt (cost factor 12) before storage — the raw password never reaches the server. File encryption keys are derived client-side from the raw password, so our servers cannot decrypt uploaded files. Even if our infrastructure were compromised, attackers would only find encrypted data they cannot read.",
  },
  {
    category: "Security",
    question: "Can CipherRoom staff or server admins read my messages or files?",
    answer:
      "No. Room passwords are server-hashed using bcrypt (cost factor 12) and never stored in raw form. Because file encryption keys are derived on your device using the raw password, servers cannot decrypt or view your files.",
  },
  {
    category: "Expiration & Data",
    question: "How long do CipherRoom temp chats last?",
    answer:
      "CipherRoom temp chats last for the duration you choose when creating the room: 1 hour, 6 hours, or 24 hours. Once the expiration timer finishes, all messages, files, notes, and room metadata are permanently and irreversibly deleted from the database and cloud storage via cascading delete operations.",
  },
  {
    category: "Expiration & Data",
    question: "Does CipherRoom have self-destructing chat?",
    answer:
      "Yes. Every CipherRoom chat is a self-destructing chat by design. All messages sent within a room are permanently destroyed when the room's expiration timer elapses. There are no backups, no archives, and no way to recover messages after deletion — making it ideal for sensitive conversations that shouldn't persist.",
  },
  {
    category: "Expiration & Data",
    question: "Can expired files or messages be recovered?",
    answer:
      "No. Once a room expires or is cleaned up, its data is permanently destroyed. CipherRoom maintains zero backups or recovery logs for expired rooms. This is by design — auto-delete file sharing means your data truly disappears.",
  },
  {
    category: "Features",
    question: "What is ephemeral file sharing on CipherRoom?",
    answer:
      "Ephemeral file sharing on CipherRoom means files you upload are encrypted in your browser, stored temporarily on our servers, and automatically deleted when the room expires. Files are encrypted using AES-256-GCM before upload, so the server only holds encrypted data. Supported formats include images, PDFs, ZIPs, and more — up to 100MB per file.",
  },
  {
    category: "Usage & Limits",
    question: "What room expiration durations are available?",
    answer:
      "When creating a room, you can choose between 1 hour, 6 hours, or 24 hours. 24 hours is the maximum allowed lifetime for any temporary room.",
  },
  {
    category: "Usage & Limits",
    question: "Are there file size or message limits?",
    answer:
      "Yes. The maximum file upload size is 100MB per file. Messages are capped at 5,000 characters and collaborative notes support up to 50,000 characters to maintain optimal real-time performance.",
  },
  {
    category: "Comparison",
    question: "How does CipherRoom compare to email or Slack for sharing sensitive info?",
    answer:
      "Email and Slack store messages and files indefinitely on their servers, can be subpoenaed, and are vulnerable to data breaches. CipherRoom is designed specifically for temporary encrypted rooms — everything is end-to-end encrypted, requires no account, and automatically self-destructs. There's no permanent record, no data mining, and no way for anyone (including CipherRoom) to access your encrypted content.",
  },
  {
    category: "Support",
    question: "How do I report bugs or suggest new features?",
    answer:
      "You can submit feedback directly using our Contact Us form or send an email to saisuhas1212@gmail.com. We welcome suggestions, feature requests, and bug reports!",
  },
];

// Generate FAQPage JSON-LD structured data
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQS.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20 selection:text-accent font-sans">
      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Top Navbar */}
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
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            CipherRoom FAQ — Encryption, Temp Chats &amp; More
          </h1>
          <p className="mt-2 text-sm text-muted">
            Everything you need to know about CipherRoom encryption, temporary encrypted rooms, ephemeral file sharing, and self-destructing chat.
          </p>
        </div>

        {/* FAQ Accordion List (Client Component) */}
        <FAQAccordion faqs={FAQS} />

        {/* Contact CTA */}
        <div className="mt-10 p-6 bg-card border border-border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">Still have questions or need help?</h3>
            <p className="text-xs text-muted mt-1">Our support team is ready to answer any questions or receive your suggestions.</p>
          </div>
          <Link
            href="/contact"
            className="px-4 py-2 bg-accent text-background font-mono text-xs font-bold rounded hover:bg-accent-dim transition-colors shrink-0"
          >
            Contact Us →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
