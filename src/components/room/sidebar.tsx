"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ExpiryCountdown } from "./expiry-countdown";
import { AuditLog } from "./audit-log";
import { getRoomPasswordInMemory } from "@/lib/password-store";

interface SidebarProps {
  roomId: string;
  roomName: string;
  roomSlug: string;
  roomExpiresAt: string;
  roomCreatedBy: string;
  username: string;
  roomPassword?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  roomId,
  roomName,
  roomSlug,
  roomExpiresAt,
  roomCreatedBy,
  username,
  roomPassword,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [copiedType, setCopiedType] = useState<"link" | "password" | "both" | "invite" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const effectivePassword = roomPassword || (typeof window !== "undefined" ? getRoomPasswordInMemory(roomSlug) : "") || "";
  const roomUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${roomSlug}` : `/room/${roomSlug}`;

  useEffect(() => {
    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: username } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            username,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, username]);

  const handleCopyLink = async () => {
    const url = roomUrl || `${window.location.origin}/room/${roomSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedType("link");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyPassword = async () => {
    if (!effectivePassword) return;
    try {
      await navigator.clipboard.writeText(effectivePassword);
      setCopiedType("password");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyBoth = async () => {
    const url = roomUrl || `${window.location.origin}/room/${roomSlug}`;
    const text = effectivePassword
      ? `Room: r/${roomName}\nLink: ${url}\nPassword: ${effectivePassword}`
      : `Room: r/${roomName}\nLink: ${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType("both");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareOrInvite = async () => {
    const url = roomUrl || `${window.location.origin}/room/${roomSlug}`;
    const inviteText = `Join my encrypted room "r/${roomName}" on CipherRoom:\n${url}${
      effectivePassword ? `\nPassword: ${effectivePassword}` : ""
    }`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `CipherRoom - r/${roomName}`,
          text: `Join my secure temporary room on CipherRoom${
            effectivePassword ? ` (Password: ${effectivePassword})` : ""
          }:`,
          url,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(inviteText);
      setCopiedType("invite");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border flex flex-col h-full bg-card transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Room header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-accent">r/</span>
              <h2 className="font-mono font-bold text-sm text-foreground truncate">
                {roomName}
              </h2>
            </div>
            <p className="text-[10px] font-mono text-muted truncate">
              Created by {roomCreatedBy}
            </p>
          </div>
          {/* Close button (mobile only) */}
          <button 
            className="md:hidden text-muted hover:text-foreground p-1 shrink-0"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Online count */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted">Online</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-xs font-mono text-foreground font-bold">
                {onlineCount}
              </span>
            </div>
          </div>
        </div>

        {/* Expiry */}
        <div className="px-4 py-3 border-b border-border">
          <ExpiryCountdown expiresAt={roomExpiresAt} />
        </div>

        {/* Room Access (Link & Password) Tab Section */}
        <div className="p-4 border-b border-border bg-card/60">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-accent"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">
                Room Access
              </span>
            </div>
            <span className="text-[9px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5">
              Invite
            </span>
          </div>

          {/* Room Link Box */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted mb-1">
              <span>ROOM LINK</span>
              <span className="text-[9px] text-muted/60">CLICK TO COPY</span>
            </div>
            <div
              onClick={handleCopyLink}
              title="Click to copy link"
              className="group relative flex items-center justify-between p-2 bg-background border border-border hover:border-accent/60 cursor-pointer transition-colors"
            >
              <span className="text-xs font-mono text-muted group-hover:text-foreground truncate select-all pr-2">
                {roomUrl || `/room/${roomSlug}`}
              </span>
              <div className="shrink-0 text-muted group-hover:text-accent transition-colors">
                {copiedType === "link" ? (
                  <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Password Box */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted mb-1">
              <span>PASSWORD</span>
              {effectivePassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[9px] text-muted hover:text-accent font-mono transition-colors"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              ) : null}
            </div>
            <div
              onClick={effectivePassword ? handleCopyPassword : handleCopyLink}
              title={effectivePassword ? "Click to copy password" : "Password required upon joining"}
              className="group relative flex items-center justify-between p-2 bg-background border border-border hover:border-accent/60 cursor-pointer transition-colors"
            >
              <span className="text-xs font-mono text-foreground tracking-wider select-all pr-2">
                {effectivePassword
                  ? (showPassword ? effectivePassword : "••••••••")
                  : "••••••••"}
              </span>
              <div className="shrink-0 text-muted group-hover:text-accent transition-colors">
                {copiedType === "password" ? (
                  <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyBoth}
              className={`py-1.5 px-2 text-[11px] font-mono border transition-all flex items-center justify-center gap-1.5 ${
                copiedType === "both"
                  ? "border-accent bg-accent text-background font-bold shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                  : "border-accent/40 text-accent hover:border-accent hover:bg-accent/10 bg-accent/5"
              }`}
            >
              {copiedType === "both" ? (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{effectivePassword ? "Copied Both!" : "Copied Link!"}</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{effectivePassword ? "Copy Both" : "Copy Link"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareOrInvite}
              className={`py-1.5 px-2 text-[11px] font-mono border transition-all flex items-center justify-center gap-1.5 ${
                copiedType === "invite"
                  ? "border-accent bg-accent text-background font-bold shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                  : "border-border text-foreground hover:border-accent hover:text-accent bg-card hover:bg-card-hover"
              }`}
            >
              {copiedType === "invite" ? (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Realtime Security Audit Feed */}
        <AuditLog roomId={roomId} username={username} />

        {/* Actions */}
        <div className="p-4 mt-auto border-t border-border">
          <Link
            href="/"
            className="block w-full py-2 text-center text-xs font-mono text-muted border border-border hover:border-foreground/20 hover:text-foreground transition-colors"
          >
            Leave Room
          </Link>
        </div>
      </div>
    </>
  );
}
