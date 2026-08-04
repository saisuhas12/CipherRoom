"use client";

import { useState } from "react";
import { createRoom } from "@/lib/actions/room";
import { setRoomPasswordInMemory } from "@/lib/password-store";

interface CreateRoomDialogProps {
  username: string;
  onClose: () => void;
}

export function CreateRoomDialog({ username, onClose }: CreateRoomDialogProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [expiryHours, setExpiryHours] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdRoom, setCreatedRoom] = useState<{
    slug: string;
    url: string;
    expiresAt: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await createRoom({
        name: name.trim(),
        password,
        expiryHours,
        username,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.room) {
        setCreatedRoom({
          slug: result.room.slug,
          url: result.room.url,
          expiresAt: result.room.expiresAt,
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.url);
    }
  };

  const handleEnterRoom = () => {
    if (createdRoom) {
      // Store password in short-lived memory reference
      setRoomPasswordInMemory(createdRoom.slug, password);
      window.location.href = `/room/${createdRoom.slug}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-mono font-bold text-sm text-foreground">
            {createdRoom ? "Room Created" : "Create Room"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground font-mono text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {createdRoom ? (
            /* Success state */
            <div className="space-y-4">
              <div className="p-4 border border-accent/20 bg-accent/5">
                <p className="text-xs font-mono text-accent mb-1">Room URL</p>
                <p className="text-sm font-mono text-foreground break-all">
                  {createdRoom.url}
                </p>
              </div>

              <div className="p-4 border border-border">
                <p className="text-xs font-mono text-muted mb-1">Password</p>
                <p className="text-sm font-mono text-foreground">{password}</p>
              </div>

              <p className="text-xs text-muted font-mono">
                Share the URL and password with your collaborators. Remember: this room will be
                permanently deleted after expiry.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="flex-1 py-2.5 border border-border text-foreground font-mono text-sm hover:border-accent hover:text-accent transition-colors"
                >
                  Copy URL
                </button>
                <button
                  onClick={handleEnterRoom}
                  className="flex-1 py-2.5 bg-accent text-background font-mono font-bold text-sm hover:bg-accent/90 transition-colors"
                >
                  Enter Room →
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">
                  Room Name
                </label>
                <input
                  type="text"
                  name="room-name"
                  id="room-name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. alpha"
                  maxLength={50}
                  autoFocus
                  className="w-full bg-background border border-border px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">
                  Password
                </label>
                <input
                  type="text"
                  name="room-passcode"
                  id="room-passcode"
                  autoComplete="one-time-code"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  data-form-type="other"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  maxLength={128}
                  className="w-full bg-background border border-border px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors input-passcode"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-2">
                  Expires In
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "1", label: "1 Hour" },
                    { value: "6", label: "6 Hours" },
                    { value: "24", label: "24 Hours" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setExpiryHours(option.value)}
                      className={`flex-1 py-2 text-xs font-mono border transition-colors ${expiryHours === option.value
                        ? "border-accent text-accent bg-accent/5"
                        : "border-border text-muted hover:border-foreground/20"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 font-mono">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || !name.trim() || !password}
                className="w-full py-3 bg-accent text-background font-mono font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Room"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
