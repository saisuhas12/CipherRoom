"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { getPublicMessages, sendPublicMessage } from "@/lib/actions/messages";
import type { Message } from "@/lib/supabase/types";

interface PublicChatProps {
  username: string | null;
  onRequireUsername: () => void;
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

export function LiveChatPreview({
  username,
  onRequireUsername,
}: PublicChatProps) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [isOpen, setIsOpen] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize state and check local storage preference (default to open)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("cipherroom_chat_preview_open");
      if (saved === "false") {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    try {
      localStorage.setItem(
        "cipherroom_chat_preview_open",
        open ? "true" : "false"
      );
    } catch {
      // ignore
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch real public messages from Supabase
  useEffect(() => {
    getPublicMessages()
      .then((msgs) => {
        if (msgs) {
          setMessages(msgs);
        }
        setTimeout(scrollToBottom, 150);
      })
      .catch((err) => {
        console.error("Failed to load real-time public messages:", err);
      });
  }, [scrollToBottom]);

  // Subscribe to Realtime messages + Presence + Typing on global-chat
  useEffect(() => {
    const channel = supabase.channel("room:global-chat", {
      config: {
        presence: {
          key: username || `guest_${Math.random().toString(36).slice(2, 6)}`,
        },
      },
    });

    channel
      .on("broadcast", { event: "message" }, (payload) => {
        const newMsg = payload.payload?.message as Message;
        if (newMsg) {
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
          setTypingUsers((prev) =>
            prev.includes(typingUser) ? prev : [...prev, typingUser]
          );
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
          }, 3000);
        }
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            username: username || "Guest",
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username, scrollToBottom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    // Broadcast real typing event
    if (username && channelRef.current) {
      if (!typingTimeoutRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: { username },
        });
        typingTimeoutRef.current = setTimeout(() => {
          typingTimeoutRef.current = null;
        }, 2000);
      }
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!username) {
      onRequireUsername();
      return;
    }

    const content = input.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setInput("");

    const result = await sendPublicMessage(username, content);
    if (result.error) {
      setInput(content);
    } else if (result.success && result.message) {
      channelRef.current?.send({
        type: "broadcast",
        event: "message",
        payload: { message: result.message },
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === result.message.id)) return prev;
        return [...prev, result.message];
      });
      setTimeout(scrollToBottom, 100);
    }

    setIsSending(false);
  };

  const handleInputInteraction = () => {
    if (!username) {
      onRequireUsername();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Floating Reopen Button (visible when chat is closed/collapsed) */}
      <button
        type="button"
        onClick={() => handleToggle(true)}
        aria-label="Open Live Chat"
        aria-expanded={isOpen}
        className={`fixed left-3 sm:left-4 lg:left-6 top-24 z-40 bg-card/95 hover:bg-card border border-border hover:border-accent text-foreground font-mono text-xs py-2 px-3 sm:py-2.5 sm:px-3.5 shadow-2xl backdrop-blur-md flex items-center gap-2.5 transition-all duration-300 ease-out hover:scale-105 active:scale-95 group cursor-pointer hover:shadow-[0_0_20px_rgba(0,255,136,0.25)] ${isOpen
            ? "opacity-0 -translate-x-12 pointer-events-none"
            : "opacity-100 translate-x-0 pointer-events-auto"
          }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
          <svg
            className="w-4 h-4 text-accent group-hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className="font-bold tracking-wide text-xs">Live Chat</span>
        <span className="text-[10px] text-accent/90 border border-accent/30 bg-accent/10 px-1 py-0.2">
          {onlineCount}
        </span>
      </button>

      {/* Mobile Backdrop overlay (only on very small screens when open) */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:hidden transition-opacity duration-300 ${isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
        onClick={() => handleToggle(false)}
        aria-hidden="true"
      />

      {/* Persistent Live Chat Panel */}
      <aside
        aria-label="Live Chat Panel"
        className={`fixed z-40 left-3 sm:left-4 lg:left-6 top-20 sm:top-24 w-[calc(100vw-1.5rem)] sm:w-[350px] lg:w-[340px] xl:w-[370px] max-h-[calc(100vh-6rem)] sm:max-h-[530px] lg:max-h-[560px] bg-card/95 backdrop-blur-xl border border-border border-t-2 border-t-accent shadow-2xl flex flex-col transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto shadow-[0_0_35px_rgba(0,0,0,0.9),0_0_15px_rgba(0,255,136,0.08)]"
            : "-translate-x-[calc(100%+3rem)] opacity-0 pointer-events-none"
          }`}
      >
        {/* Header */}
        <div className="p-3 sm:p-3.5 border-b border-border flex items-center justify-between bg-background/60 select-none">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse shrink-0 shadow-[0_0_8px_rgba(0,255,136,0.9)]" />
              <h2 className="font-mono font-bold text-xs sm:text-sm text-foreground tracking-wide flex items-center gap-1.5 truncate">
                LIVE CHAT
                <span className="text-[9px] font-mono font-normal text-accent border border-accent/40 bg-accent/10 px-1.5 py-0.5 uppercase tracking-wider">
                  24/7 LOBBY
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
              <span className="text-foreground/90 font-medium">
                {onlineCount} {onlineCount === 1 ? "user" : "users"} online
              </span>
              <span>•</span>
              <span className="text-accent-dim">Encrypted · Auto-purged 24h</span>
            </div>
          </div>

          {/* Close X Button */}
          <button
            type="button"
            onClick={() => handleToggle(false)}
            className="p-1.5 text-muted hover:text-accent border border-border hover:border-accent/40 bg-card hover:bg-accent/10 transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-accent shrink-0 ml-2"
            title="Close live chat"
            aria-label="Close live chat"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Real-time Message Stream */}
        <div
          tabIndex={isOpen ? 0 : -1}
          className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5 font-mono text-xs no-scrollbar bg-background/40"
        >
          {/* E2EE System Notice Banner */}
          {/* 
          <div className="py-1 px-2 border border-accent/20 bg-accent/5 text-[10px] text-accent/80 font-mono leading-relaxed flex items-center gap-1.5 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
            <span>24/7 Global Encrypted Lobby. Messages auto-delete after 24h.</span>
          </div>
          */}

          {messages.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-muted/60 space-y-2">
              <svg
                className="w-7 h-7 text-accent/40 stroke-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-xs text-foreground/80 font-medium">
                No messages yet in the lobby
              </p>
              <p className="text-[10px] text-muted/50 leading-relaxed max-w-[200px]">
                Be the first to send a message! Encrypted and temporary.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = username && msg.username === username;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-0.5 leading-relaxed animate-fade-in ${isOwn ? "items-end" : "items-start"
                    }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-muted">
                    <span
                      className={`font-semibold truncate max-w-[120px] ${isOwn ? "text-accent" : "text-foreground/90"
                        }`}
                    >
                      {msg.username}
                    </span>
                    <span className="text-[9px] text-muted/50">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-2 max-w-[88%] break-words text-xs border ${isOwn
                        ? "bg-accent/10 border-accent/40 text-foreground"
                        : "bg-card/90 border-border text-foreground/90"
                      }`}
                  >
                    {decodeLegacyText(msg.content)}
                  </div>
                </div>
              );
            })
          )}

          {/* Real Typing Indicator (synced across active clients) */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted/70 pt-1">
              <div className="flex items-center gap-1 bg-card/60 border border-border px-2 py-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-typing-dot-1" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-typing-dot-2" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-typing-dot-3" />
                <span className="ml-1 text-muted/80 text-[9px]">
                  {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input / Action Bar */}
        <div className="p-2.5 sm:p-3 border-t border-border bg-card/90">
          {!username && (
            <div
              onClick={onRequireUsername}
              className="mb-2 p-1.5 sm:p-2 bg-accent/5 border border-accent/25 cursor-pointer hover:bg-accent/10 transition-colors flex items-center justify-between group"
            >
              <span className="text-[11px] font-mono text-accent truncate">
                Pick a handle to chat in 24/7 lobby
              </span>
              <span className="text-[10px] font-mono text-accent group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
                Set Handle →
              </span>
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-1.5 sm:gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onClick={handleInputInteraction}
              onFocus={handleInputInteraction}
              placeholder={
                username
                  ? "Type encrypted message..."
                  : "Click to set handle & chat..."
              }
              maxLength={5000}
              className="flex-1 bg-background border border-border px-2.5 py-1.5 sm:px-3 sm:py-2 text-foreground font-mono text-xs placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || (!input.trim() && !!username)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-accent text-background font-mono font-bold text-xs hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 flex items-center justify-center cursor-pointer"
              title={username ? "Send message" : "Choose handle"}
              aria-label="Send message"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>

          {/* Quick status indicator footer */}
          <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-muted/60">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent/80 rounded-full" />
              <span>Real-time · 24h auto-delete</span>
            </div>
            <span>No login required</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// Export both PublicChat and LiveChatPreview for compatibility
export const PublicChat = LiveChatPreview;
