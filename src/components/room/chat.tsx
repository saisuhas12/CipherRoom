"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { sendMessage, getMessages } from "@/lib/actions/messages";
import type { Message } from "@/lib/supabase/types";

interface ChatProps {
  roomId: string;
  username: string;
}

export function Chat({ roomId, username }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
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

    const result = await sendMessage(roomId, username, content);
    if (result.error) {
      setInput(content); // Restore on error
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

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`group py-1.5 px-2 hover:bg-white/[0.02] transition-colors ${
              msg.username === username ? "" : ""
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono font-bold text-accent shrink-0">
                {msg.username}
              </span>
              <span className="text-sm text-foreground break-all leading-relaxed">
                {msg.content}
              </span>
              <span className="text-[10px] font-mono text-muted/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(msg.created_at)}
              </span>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1">
          <p className="text-xs font-mono text-muted animate-pulse">
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.length} people are typing...`}
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
          className="px-4 py-2 bg-accent text-background font-mono font-bold text-xs hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
