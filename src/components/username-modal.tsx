"use client";

import { useState } from "react";

interface UsernameModalProps {
  onSubmit: (username: string) => { error?: string; success?: boolean };
}

export function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = onSubmit(value.trim());
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 border border-border bg-card p-8">
        <div className="mb-6">
          <h2 className="text-xl font-mono font-bold text-foreground tracking-tight">
            Choose a Username
          </h2>
          <p className="text-sm text-muted mt-2">
            This is how you&apos;ll appear in rooms. No account needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. john_doe"
              maxLength={20}
              autoFocus
              className="w-full bg-background border border-border px-4 py-3 text-foreground font-mono text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <p className="text-xs text-muted mt-2">
              3–20 characters. Letters, numbers, underscore only.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={value.trim().length < 3}
            className="w-full bg-accent text-background font-mono font-bold py-3 px-4 text-sm hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}
