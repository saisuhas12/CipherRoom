"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { sendMessage, getMessages } from "@/lib/actions/messages";
import type { Message } from "@/lib/supabase/types";
import { UserBadge } from "./user-badge";
import { useUserGeo } from "@/hooks/use-user-geo";

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

export function Chat({ roomId, username, userGeoMap = {} }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [broadcastGeoMap, setBroadcastGeoMap] = useState<
    Record<string, { countryCode: string; countryName: string }>
  >({});
  const geo = useUserGeo();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Combined geo map merging presence prop and message broadcast metadata
  const activeGeoMap = { ...userGeoMap, ...broadcastGeoMap };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load initial messages
  useEffect(() => {
    getMessages(roomId).then((msgs) => {
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });
  }, [roomId, scrollToBottom]);

  // Subscribe to realtime messages + typing
  useEffect(() => {
    const existing = supabase
      .getChannels()
      .find((c) => c.topic === `realtime:room:${roomId}` || c.topic === `room:${roomId}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase.channel(`room:${roomId}`);

    const isAlreadySubscribed =
      typeof (channel as any).isSubscribed === "function"
        ? (channel as any).isSubscribed()
        : channel.state !== "closed";

    if (!isAlreadySubscribed) {
      channel
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
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 100);
          }
        })
        .on("broadcast", { event: "typing" }, (payload) => {
          const typingUser = payload.payload?.username as string;
          if (typingUser && typingUser !== username) {
            setTypingUsers((prev) => {
              if (prev.includes(typingUser)) return prev;
              return [...prev, typingUser];
            });
            // Remove after 3 seconds
            setTimeout(() => {
              setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
            }, 3000);
          }
        })
        .subscribe();
    }

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, username, scrollToBottom]);

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { username },
    });

    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

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
        return [...prev, result.message];
      });
      setTimeout(scrollToBottom, 100);
    }
    setIsSending(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted font-mono">
              No messages yet. Say something.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const { text: displayText, countryCode: msgGeoCode } = parseMessagePayload(msg.content);
          const resolvedCountryCode =
            msgGeoCode ||
            (msg.username === username
              ? geo.countryCode
              : activeGeoMap[msg.username]?.countryCode);

          return (
            <div
              key={msg.id}
              className={`group py-1.5 px-2 hover:bg-white/[0.02] transition-colors ${
                msg.username === username ? "" : ""
              }`}
            >
              <div className="flex items-baseline gap-2">
                <UserBadge
                  username={msg.username}
                  countryCode={resolvedCountryCode}
                  countryName={
                    msg.username === username
                      ? geo.countryName
                      : activeGeoMap[msg.username]?.countryName
                  }
                  isCurrentUser={msg.username === username}
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
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1">
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
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-border p-3 flex gap-2"
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
  );
}
