"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/landing/footer";

const CATEGORIES = [
  "Bug Report / Issue",
  "Feature Suggestion",
  "Help / Support",
  "General Inquiry",
] as const;

type Category = typeof CATEGORIES[number];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("Bug Report / Issue");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      setErrorMessage("Please fill in all required fields.");
      setStatus("error");
      return;
    }

    setErrorMessage("");

    const gmailUrl = getGmailUrl();
    const newWindow = window.open(gmailUrl, "_blank");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      window.location.href = gmailUrl;
    }

    setStatus("success");
  };

  const getEncodedSubject = () => encodeURIComponent(`[CipherRoom ${category}] ${subject || "Inquiry"}`);
  const getEncodedBody = () =>
    encodeURIComponent(
      `Name: ${name || "Not provided"}\nEmail: ${email || "Not provided"}\nCategory: ${category}\n\nMessage:\n${message || "(No message provided)"}`
    );

  const getGmailUrl = () =>
    `https://mail.google.com/mail/?view=cm&fs=1&to=saisuhas1212@gmail.com&su=${getEncodedSubject()}&body=${getEncodedBody()}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-accent/20 selection:text-accent font-sans">
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
            SUPPORT & FEEDBACK
          </div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold text-foreground tracking-tight">
            Contact Us
          </h1>
          <p className="mt-2 text-sm text-muted">
            Have a question, encountered a bug, or want to suggest a new privacy feature? Reach out directly.
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-card border border-accent/40 rounded-lg p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 text-accent flex items-center justify-center mx-auto text-xl font-bold font-mono">
              ✓
            </div>
            <h2 className="text-xl font-mono font-bold text-foreground">Opening Gmail Web App</h2>
            <p className="text-sm text-muted max-w-md mx-auto">
              Your message details have been pre-filled. If Gmail web app did not open automatically,{" "}
              <a
                href={getGmailUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 font-mono font-semibold"
              >
                click here to compose in Gmail
              </a>.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setName("");
                setEmail("");
                setSubject("");
                setMessage("");
              }}
              className="mt-4 px-4 py-2 bg-accent text-background font-mono text-xs font-bold rounded hover:bg-accent-dim transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-wider">
                  Category <span className="text-accent">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-xs font-mono py-2.5 px-3 rounded border text-left transition-all ${
                        category === cat
                          ? "border-accent bg-accent/10 text-accent font-semibold"
                          : "border-border bg-background/50 text-muted hover:border-muted hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono text-muted mb-1.5 uppercase tracking-wider">
                    Your Name <span className="text-muted font-normal text-[10px]">(Optional)</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g. Alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-muted mb-1.5 uppercase tracking-wider">
                    Your Email <span className="text-accent">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent font-sans"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-xs font-mono text-muted mb-1.5 uppercase tracking-wider">
                  Subject <span className="text-accent">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  placeholder="Brief overview of your issue or suggestion"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent font-sans"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-mono text-muted mb-1.5 uppercase tracking-wider">
                  Message <span className="text-accent">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Describe your issue, suggestion, or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent font-sans resize-y"
                />
              </div>

              {/* Error Box */}
              {status === "error" && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-xs font-mono">
                  ⚠ {errorMessage}
                </div>
              )}

              {/* Submit Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full sm:w-auto px-6 py-2.5 bg-accent text-background font-mono text-xs font-bold uppercase rounded hover:bg-accent-dim transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {status === "submitting" ? (
                    <>
                      <span className="w-3 h-3 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message →"
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Fallback Info */}
            <div className="border-t border-border pt-4 mt-6">
              <p className="text-xs font-mono text-muted">
                If any error occurred while sending message, send manual email to{" "}
                <a
                  href="mailto:saisuhas1212@gmail.com"
                  className="text-accent underline underline-offset-2 hover:text-accent-dim transition-colors font-semibold"
                >
                  saisuhas1212@gmail.com
                </a>
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
