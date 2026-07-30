"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JoinRoomDialogProps {
  onClose: () => void;
}

export function JoinRoomDialog({ onClose }: JoinRoomDialogProps) {
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = slug.trim().toLowerCase();
    if (!trimmed) {
      setError("Room code is required.");
      return;
    }

    // Navigate to room page where password will be requested
    router.push(`/room/${trimmed}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-mono font-bold text-sm text-foreground">
            Join Room
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground font-mono text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">
                Room Code ("r" before room code e.g. ralpha)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder='Enter "r" before room code e.g. ralpha'
                autoFocus
                className="w-full bg-background border border-border px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
              <p className="text-xs text-muted mt-1.5">
                Enter the room code from the URL you received.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-400 font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={!slug.trim()}
              className="w-full py-3 bg-accent text-background font-mono font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
