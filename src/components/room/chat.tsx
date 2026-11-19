"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { supabase } from "@/lib/supabase/client";
import { sendMessage, getMessages } from "@/lib/actions/messages";
import type { Message } from "@/lib/supabase/types";
import { UserBadge } from "./user-badge";
import { useUserGeo } from "@/hooks/use-user-geo";

// Cap the in-memory message list so it never grows unboundedly.
// Oldest messages are dropped from the top; the UI always shows the
// most-recent MAX_MESSAGES entries.
const MAX_MESSAGES = 300;

interface ChatProps {
  roomId: string;
  username: string;
  userGeoMap?: Record<string, { countryCode: string; countryName: string }>;
}

// Simple decoder for any historical entity strings so text displays as normal raw text
function decodeLegacyText(content: string): string {
  if (!content) return "";
  return content
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// Extracts optional [geo:XX] prefix embedded in message content
function parseMessagePayload(raw: string): { text: string; countryCode?: string } {
  if (!raw) return { text: "" };
  const match = raw.match(/^\[geo:([A-Za-z]{2})\]([\s\S]*)$/);
  if (match) {
    return {
      countryCode: match[1].toUpperCase(),
      text: decodeLegacyText(match[2]),
    };
  }
  return { text: decodeLegacyText(raw) };
}

// ─── Memoised message row ────────────────────────────────────────────────────
// Extracted so React skips re-rendering unchanged rows when new messages arrive.
interface MessageRowProps {
  msg: Message;
  isCurrentUser: boolean;
  displayText: string;
  resolvedCountryCode?: string;
  countryName?: string;
  geoForCurrentUser?: string;
  geoNameForCurrentUser?: string;
}

const MessageRow = memo(function MessageRow({
  msg,
  isCurrentUser,
  displayText,
  resolvedCountryCode,
  countryName,
}: MessageRowProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`group py-1.5 px-2 hover:bg-white/[0.02] transition-colors`}
    >
      <div className="flex items-baseline gap-2">
        <UserBadge
          username={msg.username}
          countryCode={resolvedCountryCode}
          countryName={countryName}
          isCurrentUser={isCurrentUser}
          className="text-xs font-mono font-bold text-accent shrink-0"
          tooltipSide="bottom"
        />
        <span className="text-sm text-foreground break-words leading-relaxed whitespace-pre-wrap">
          {displayText}
        </span>
        <span className="text-[10px] font-mono text-muted/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(msg.created_at)}
        </span>
      </div>
    </div>
  );
});

// ─── Chat component ──────────────────────────────────────────────────────────
export function Chat({ roomId, username, userGeoMap = {} }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [broadcastGeoMap, setBroadcastGeoMap] = useState<
    Record<string, { countryCode: string; countryName: string }>
  >({});
  const geo = useUserGeo();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Track if user is scrolled near the bottom so incoming messages don't yank scroll
  const isNearBottomRef = useRef(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Typing indicator: map of username → timeout-id so we can clear & reset per user
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Per-keystroke typing broadcast debounce
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const atBottom = distanceFromBottom < 100;
    isNearBottomRef.current = atBottom;
    setShowScrollBottom((prev) => (prev !== !atBottom ? !atBottom : prev));
  }, []);

  // Scroll helper using RAF — uses container.scrollTo for precise contained scrolling
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
      }
      isNearBottomRef.current = true;
      setShowScrollBottom(false);
    });
  }, []);

  // Stable ref so the channel closure always gets the latest scrollToBottom
  // without being listed as an effect dependency (which would re-subscribe on every render).
  const scrollToBottomRef = useRef(scrollToBottom);
  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom;
  }, [scrollToBottom]);

  // Combined geo map merging presence prop and message broadcast metadata
  const activeGeoMap = { ...userGeoMap, ...broadcastGeoMap };

  // ── Load initial messages (runs once per roomId) ──────────────────────────
  useEffect(() => {
    getMessages(roomId).then((msgs) => {
      // Already capped at 500 server-side; apply client cap for safety
      const capped = msgs.length > MAX_MESSAGES ? msgs.slice(-MAX_MESSAGES) : msgs;
      setMessages(capped);
      scrollToBottomRef.current(false);
    });
  }, [roomId]); // scrollToBottom intentionally excluded — use ref instead

  // ── Subscribe to realtime messages + typing ───────────────────────────────
  useEffect(() => {
    // Remove any stale channel with the same topic before creating a new one
    const existing = supabase
      .getChannels()
      .find((c) => c.topic === `realtime:room:${roomId}` || c.topic === `room:${roomId}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(`room:${roomId}`)
      .on("broadcast", { event: "message" }, (payload) => {
        const newMsg = payload.payload?.message as Message;
        const msgGeo = payload.payload?.geo as
          | { countryCode?: string; countryName?: string }
          | undefined;

        if (newMsg) {
          if (msgGeo && newMsg.username && msgGeo.countryCode) {
            setBroadcastGeoMap((prev) => ({
              ...prev,
              [newMsg.username]: {
                countryCode: msgGeo.countryCode!,
                countryName: msgGeo.countryName || "",
              },
            }));
          }
          setMessages((prev) => {
            // Deduplicate
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            const next = [...prev, newMsg];
            // Trim oldest messages when the cap is exceeded
            return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
          });

          // If the sender was in typingUsers, clear their typing state immediately
          if (newMsg.username) {
            const existingTimer = typingTimersRef.current.get(newMsg.username);
            if (existingTimer) {
              clearTimeout(existingTimer);
              typingTimersRef.current.delete(newMsg.username);
            }
            setTypingUsers((prev) => prev.filter((u) => u !== newMsg.username));
          }

          // Only auto-scroll if user was already at or near the bottom.
          // If the user has scrolled up to read history, do NOT yank their view down.
          if (isNearBottomRef.current) {
            scrollToBottomRef.current();
          }
        }
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        const typingUser = payload.payload?.username as string;
        if (typingUser && typingUser !== username) {
          setTypingUsers((prev) => {
            if (prev.includes(typingUser)) return prev;
            return [...prev, typingUser];
          });

          // Clear any existing timer for this user before setting a new one
          const existing = typingTimersRef.current.get(typingUser);
          if (existing) clearTimeout(existing);

          const timer = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
            typingTimersRef.current.delete(typingUser);
          }, 3000);
          typingTimersRef.current.set(typingUser, timer);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      // Clear all typing timers on unmount / re-subscribe
      typingTimersRef.current.forEach((t) => clearTimeout(t));
      typingTimersRef.current.clear();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [roomId, username]); // scrollToBottom removed — using ref

  // ── Typing broadcast (throttled) ──────────────────────────────────────────
  const handleTyping = useCallback(() => {
    // Throttle typing broadcasts: send at most once every 2 seconds
    if (typingTimeoutRef.current) return;

    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { username },
    });

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 2000);
  }, [username]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const content = input.trim();
      if (!content || isSending) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      setIsSending(true);
      setInput("");

      const result = await sendMessage(roomId, username, content, geo.countryCode);
      if (result.error) {
        setInput(content); // Restore on error
      } else if (result.success && result.message) {
        channelRef.current?.send({
          type: "broadcast",
          event: "message",
          payload: {
            message: result.message,
            geo: {
              countryCode: geo.countryCode,
              countryName: geo.countryName,
            },
          },
        });
        setMessages((prev) => {
          if (prev.some((m) => m.id === result.message.id)) return prev;
          const next = [...prev, result.message];
          return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
        });
        scrollToBottomRef.current();
      }
      setIsSending(false);
    },
    [input, isSending, roomId, username, geo.countryCode, geo.countryName]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0 overscroll-contain"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted font-mono">
              No messages yet. Say something.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const { text: displayText, countryCode: msgGeoCode } = parseMessagePayload(msg.content);
          const isCurrentUser = msg.username === username;
          const resolvedCountryCode =
            msgGeoCode ||
            (isCurrentUser
              ? geo.countryCode
              : activeGeoMap[msg.username]?.countryCode);
          const resolvedCountryName = isCurrentUser
            ? geo.countryName
            : activeGeoMap[msg.username]?.countryName;

          return (
            <MessageRow
              key={msg.id}
              msg={msg}
              isCurrentUser={isCurrentUser}
              displayText={displayText}
              resolvedCountryCode={resolvedCountryCode}
              countryName={resolvedCountryName}
            />
          );
        })}

        {/* Sentinel at bottom to give breathing room for the floating typing indicator */}
        <div ref={messagesEndRef} className="h-6 shrink-0" />
      </div>

      {/* Input container (Fixed lower part) */}
      <div className="relative border-t border-border bg-card shrink-0 sticky bottom-0 z-20">
        {/* Floating Jump-to-bottom button when user is scrolled up */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-[calc(100%+8px)] right-4 z-20 px-2.5 py-1 bg-card/95 border border-border hover:border-accent text-accent font-mono text-xs shadow-xl flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer hover:bg-accent/10 active:scale-95 animate-fade-in"
            aria-label="Scroll to latest messages"
          >
            <span>↓ Jump to latest</span>
          </button>
        )}

        {/* Typing indicator: absolutely positioned above input bar so it never pushes or displaces messages */}
        <div
          aria-live="polite"
          className={`absolute bottom-full left-0 right-0 px-4 py-1 pointer-events-none transition-opacity duration-200 z-10 bg-background/85 backdrop-blur-xs ${
            typingUsers.length > 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          {typingUsers.length > 0 && (
            <p className="text-xs font-mono text-muted animate-pulse flex items-center gap-1.5">
              {typingUsers.length === 1 ? (
                <>
                  <UserBadge
                    username={typingUsers[0]}
                    countryCode={activeGeoMap[typingUsers[0]]?.countryCode}
                    countryName={activeGeoMap[typingUsers[0]]?.countryName}
                    className="font-bold text-accent"
                    tooltipSide="top"
                  />
                  <span>is typing...</span>
                </>
              ) : (
                <span>{typingUsers.length} people are typing...</span>
              )}
            </p>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-3 flex gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            maxLength={5000}
            className="flex-1 bg-background border border-border px-3 py-2 text-sm text-foreground font-mono placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="px-4 py-2 bg-accent text-background font-mono font-bold text-xs hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
