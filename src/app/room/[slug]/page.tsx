"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { joinRoom, getRoomBySlug } from "@/lib/actions/room";
import { useUsername } from "@/hooks/use-username";
import { UsernameModal } from "@/components/username-modal";
import { Sidebar } from "@/components/room/sidebar";
import { Chat } from "@/components/room/chat";
import { Files } from "@/components/room/files";
import { Notes } from "@/components/room/notes";

type RoomData = {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
};

type Tab = "chat" | "files" | "notes";

export default function RoomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { username, isLoading: isUsernameLoading, needsUsername, setUsername } = useUsername();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const attemptJoin = useCallback(async (pwd: string) => {
    setIsJoining(true);
    setError("");

    const result = await joinRoom({ slug, password: pwd });

    if (result.error) {
      setError(result.error);
      sessionStorage.removeItem(`room_pwd_${slug}`);
    } else if (result.room) {
      setRoom({
        id: result.room.id,
        name: result.room.name,
        slug: result.room.slug,
        expiresAt: result.room.expiresAt,
        createdBy: result.room.createdBy,
        createdAt: result.room.createdAt,
      });
      setStoredPassword(pwd);
      sessionStorage.setItem(`room_pwd_${slug}`, pwd);
      setIsAuthenticated(true);
    }

    setIsJoining(false);
  }, [slug]);

  // Auto-join with session password (runs once on mount)
  const hasAutoJoined = useRef(false);
  useEffect(() => {
    if (hasAutoJoined.current) return;
    const savedPwd = sessionStorage.getItem(`room_pwd_${slug}`);
    if (savedPwd) {
      hasAutoJoined.current = true;
      // Defer to avoid setState-in-effect lint rule
      const join = () => attemptJoin(savedPwd);
      queueMicrotask(join);
    }
  }, [slug, attemptJoin]);

  // Check if room exists
  useEffect(() => {
    getRoomBySlug(slug).then((data) => {
      if (!data) {
        setIsNotFound(true);
      } else if (new Date(data.expires_at) < new Date()) {
        setIsExpired(true);
      }
    });
  }, [slug]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    await attemptJoin(password);
  };

  // Loading state
  if (isUsernameLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-2 h-2 bg-accent animate-pulse" />
      </div>
    );
  }

  // Username required
  if (needsUsername || !username) {
    return <UsernameModal onSubmit={setUsername} />;
  }

  // Room not found
  if (isNotFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-4">
          <p className="text-6xl font-mono font-bold text-foreground mb-4">404</p>
          <p className="text-sm font-mono text-muted mb-6">Room not found.</p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 border border-border text-sm font-mono text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            ← Back Home
          </Link>
        </div>
      </div>
    );
  }

  // Room expired
  if (isExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-4">
          <div className="w-12 h-12 border-2 border-red-500/30 mx-auto mb-6 flex items-center justify-center">
            <span className="text-red-400 font-mono text-xl">×</span>
          </div>
          <h1 className="text-xl font-mono font-bold text-foreground mb-2">
            This room has expired.
          </h1>
          <p className="text-sm font-mono text-muted mb-6">
            All data has been permanently deleted. No recovery is possible.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 border border-border text-sm font-mono text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            ← Create a New Room
          </Link>
        </div>
      </div>
    );
  }

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-sm mx-4 border border-border bg-card animate-fade-in">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-mono font-bold text-sm text-foreground">
              Enter Room
            </h2>
            <p className="text-xs font-mono text-muted mt-1">
              r/{slug}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-background border border-border px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={isJoining || !password.trim()}
              className="w-full py-3 bg-accent text-background font-mono font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isJoining ? "Verifying..." : "Enter →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Room Dashboard
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {room && (
        <Sidebar
          roomId={room.id}
          roomName={room.name}
          roomSlug={room.slug}
          roomExpiresAt={room.expiresAt}
          roomCreatedBy={room.createdBy}
          username={username}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab bar */}
        <div className="flex border-b border-border bg-card">
          {(["chat", "files", "notes"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0">
          {room && activeTab === "chat" && (
            <Chat roomId={room.id} username={username} />
          )}
          {room && activeTab === "files" && (
            <Files
              roomId={room.id}
              roomExpiresAt={room.expiresAt}
              username={username}
              roomPassword={storedPassword}
            />
          )}
          {room && activeTab === "notes" && (
            <Notes roomId={room.id} username={username} />
          )}
        </div>
      </div>
    </div>
  );
}
