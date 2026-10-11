"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ExpiryCountdown } from "./expiry-countdown";
import { UserBadge } from "./user-badge";
import { useUserGeo } from "@/hooks/use-user-geo";
import { getRoomPasswordInMemory } from "@/lib/password-store";
import { extendRoom } from "@/lib/actions/room";

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
  onRoomExtended?: (newExpiresAt: string) => void;
  onPresenceSync?: (geoMap: Record<string, { countryCode: string; countryName: string }>) => void;
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
  onRoomExtended,
  onPresenceSync,
}: SidebarProps) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<
    Array<{ username: string; countryCode?: string; countryName?: string }>
  >([]);
  const geo = useUserGeo();
  const [copiedType, setCopiedType] = useState<"link" | "password" | "both" | "invite" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Extend Room state
  const isAdmin = username === roomCreatedBy;
  const [urgency, setUrgency] = useState<"normal" | "warning" | "critical">("normal");
  const [showExtendOptions, setShowExtendOptions] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [extendError, setExtendError] = useState("");
  const [extendSuccess, setExtendSuccess] = useState("");
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [currentExpiresAt, setCurrentExpiresAt] = useState(roomExpiresAt);

  const canExtend = isAdmin && urgency === "critical";

  const effectivePassword = roomPassword || (typeof window !== "undefined" ? getRoomPasswordInMemory(roomSlug) : "") || "";
  const roomUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${roomSlug}` : `/room/${roomSlug}`;

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!roomId || !username) return;

    // Remove any stale channel instance with this topic before initializing
    const existing = supabase
      .getChannels()
      .find((c) => c.topic === `realtime:presence:${roomId}` || c.topic === `presence:${roomId}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: username } },
    });

    const isAlreadySubscribed =
      typeof (channel as any).isSubscribed === "function"
        ? (channel as any).isSubscribed()
        : channel.state !== "closed";

    if (!isAlreadySubscribed) {
      try {
        channel
          .on("presence", { event: "sync" }, () => {
            const state = channel.presenceState();
            const users: Array<{ username: string; countryCode?: string; countryName?: string }> = [];
            const geoMap: Record<string, { countryCode: string; countryName: string }> = {};
            for (const key of Object.keys(state)) {
              const list = state[key] as Array<Record<string, any>>;
              if (list && list[0]) {
                const u = {
                  username: list[0].username || key,
                  countryCode: list[0].countryCode,
                  countryName: list[0].countryName,
                };
                users.push(u);
                if (u.countryCode) {
                  geoMap[u.username] = {
                    countryCode: u.countryCode,
                    countryName: u.countryName || "",
                  };
                }
              }
            }
            setOnlineUsers(users);
            setOnlineCount(users.length || Object.keys(state).length);
            onPresenceSync?.(geoMap);
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
              isSubscribedRef.current = true;
              await channel.track({
                username,
                countryCode: geo.countryCode,
                countryName: geo.countryName,
                online_at: new Date().toISOString(),
              });
            }
          });
      } catch {
        // Channel already has callbacks attached or is joined; just track
        isSubscribedRef.current = true;
        channel.track({
          username,
          countryCode: geo.countryCode,
          countryName: geo.countryName,
          online_at: new Date().toISOString(),
        });
      }
    } else {
      isSubscribedRef.current = true;
      channel.track({
        username,
        countryCode: geo.countryCode,
        countryName: geo.countryName,
        online_at: new Date().toISOString(),
      });
    }

    channelRef.current = channel;

    return () => {
      isSubscribedRef.current = false;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, username]);

  // Update presence on existing channel when geo finishes resolving
  useEffect(() => {
    if (channelRef.current && isSubscribedRef.current && geo.countryCode) {
      channelRef.current.track({
        username,
        countryCode: geo.countryCode,
        countryName: geo.countryName,
        online_at: new Date().toISOString(),
      });
    }
  }, [geo.countryCode, geo.countryName, username]);

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

  const handleExtendRoom = async (hours: string) => {
    setIsExtending(true);
    setExtendError("");
    setExtendSuccess("");

    const result = await extendRoom({
      roomId,
      slug: roomSlug,
      extensionHours: hours,
      username,
    });

    if (result.error) {
      setExtendError(result.error);
      setTimeout(() => setExtendError(""), 5000);
    } else if (result.success && result.newExpiresAt) {
      setExtendSuccess(`Room extended by ${hours}h!`);
      setCurrentExpiresAt(result.newExpiresAt);
      setShowExtendOptions(false);
      setUrgency("normal"); // Reset urgency after successful extension
      onRoomExtended?.(result.newExpiresAt);
      setTimeout(() => setExtendSuccess(""), 4000);
    }

    setIsExtending(false);
  };

  // Detect touch device for mobile info popup behavior
  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const handleExtendButtonClick = () => {
    if (!canExtend) {
      // On mobile, show info popup when tapping the disabled button
      if (isTouchDevice) {
        setShowMobileInfo(true);
        setTimeout(() => setShowMobileInfo(false), 3500);
      }
      return;
    }
    setShowExtendOptions(!showExtendOptions);
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
            <div className="text-[10px] font-mono text-muted truncate flex items-center gap-1">
              <span>Created by</span>
              <UserBadge
                username={roomCreatedBy}
                countryCode={
                  roomCreatedBy === username
                    ? geo.countryCode
                    : onlineUsers.find((u) => u.username === roomCreatedBy)?.countryCode
                }
                countryName={
                  roomCreatedBy === username
                    ? geo.countryName
                    : onlineUsers.find((u) => u.username === roomCreatedBy)?.countryName
                }
                isCurrentUser={roomCreatedBy === username}
                className="text-foreground hover:text-accent font-bold transition-colors"
                tooltipSide="bottom"
              />
            </div>
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
          {onlineUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {onlineUsers.map((u) => (
                <div
                  key={u.username}
                  className="px-2 py-0.5 bg-background border border-border text-[10px] font-mono inline-flex items-center"
                >
                  <UserBadge
                    username={u.username}
                    countryCode={u.username === username ? geo.countryCode : u.countryCode}
                    countryName={u.username === username ? geo.countryName : u.countryName}
                    isCurrentUser={u.username === username}
                    className={u.username === username ? "text-accent font-bold" : "text-muted hover:text-foreground"}
                    tooltipSide="bottom"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry */}
        <div className="px-4 py-3 border-b border-border">
          <ExpiryCountdown
            expiresAt={currentExpiresAt}
            onUrgencyChange={setUrgency}
          />
        </div>

        {/* Extend Room — Admin only */}
        {isAdmin && (
          <div className="px-4 py-3 border-b border-border">
            <div className="relative">
              {/* Extend Room Button */}
              <button
                onClick={handleExtendButtonClick}
                disabled={isExtending}
                title={
                  canExtend
                    ? "Extend the room's expiration time. Choose 1h, 6h, or 24h."
                    : "Available in the last 30 minutes before room expiry. Only the room admin can extend."
                }
                className={`w-full py-2 px-3 text-[11px] font-mono font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                  canExtend
                    ? "border-accent/60 text-accent bg-accent/5 hover:bg-accent/15 hover:border-accent cursor-pointer shadow-[0_0_8px_rgba(0,255,136,0.1)] hover:shadow-[0_0_12px_rgba(0,255,136,0.2)]"
                    : "border-border text-muted/40 bg-card cursor-not-allowed opacity-50"
                } ${isExtending ? "opacity-60" : ""}`}
              >
                {/* Clock icon */}
                <svg
                  className={`w-3.5 h-3.5 ${canExtend ? "text-accent" : "text-muted/40"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{isExtending ? "Extending..." : "Extend Room"}</span>
                {canExtend && (
                  <svg
                    className={`w-3 h-3 text-accent transition-transform ${showExtendOptions ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>

              {/* Mobile info popup (shown on tap when button is disabled) */}
              {showMobileInfo && !canExtend && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 animate-fade-in">
                  <div className="bg-background border border-border p-3 text-[10px] font-mono text-muted leading-relaxed shadow-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-3 h-3 text-accent shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <p>
                        <span className="text-foreground font-bold">Extend Room</span> allows the admin to add more time before the room expires. This becomes available in the{" "}
                        <span className="text-accent">last 30 minutes</span> before room expiry.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Extension options dropdown */}
              {showExtendOptions && canExtend && (
                <div className="mt-2 animate-fade-in">
                  <p className="text-[10px] font-mono text-muted mb-2">
                    Select extension duration:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "+1h", value: "1" },
                      { label: "+6h", value: "6" },
                      { label: "+24h", value: "24" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleExtendRoom(opt.value)}
                        disabled={isExtending}
                        className="py-1.5 px-2 text-[11px] font-mono font-bold border border-accent/30 text-accent bg-accent/5 hover:bg-accent/15 hover:border-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Success message */}
              {extendSuccess && (
                <p className="mt-2 text-[10px] font-mono text-accent flex items-center gap-1.5 animate-fade-in">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {extendSuccess}
                </p>
              )}

              {/* Error message */}
              {extendError && (
                <p className="mt-2 text-[10px] font-mono text-red-400 animate-fade-in">
                  {extendError}
                </p>
              )}
            </div>
          </div>
        )}

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
