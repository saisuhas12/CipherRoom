"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: "join" | "leave" | "upload" | "download" | "preview" | "delete" | "note";
  message: string;
}

interface AuditLogProps {
  roomId: string;
  username: string;
}

export function AuditLog({ roomId, username }: AuditLogProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addEntry = useCallback((type: AuditLogEntry["type"], message: string) => {
    const newEntry: AuditLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      type,
      message,
    };
    setEntries((prev) => [...prev.slice(-49), newEntry]);
  }, []);

  // Initial self-join entry
  useEffect(() => {
    addEntry("join", `You (${username}) entered the room`);
  }, [username, addEntry]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  // Subscribe to audit broadcast channel
  useEffect(() => {
    const channel = supabase
      .channel(`room-audit:${roomId}`)
      .on("broadcast", { event: "audit_event" }, (payload) => {
        const data = payload.payload as {
          type: AuditLogEntry["type"];
          message: string;
          actor?: string;
        };
        if (data && data.message) {
          addEntry(data.type, data.message);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, addEntry]);

  const getTypeBadgeColor = (type: AuditLogEntry["type"]) => {
    switch (type) {
      case "upload":
        return "text-accent border-accent/30 bg-accent/5";
      case "download":
        return "text-amber-400 border-amber-400/30 bg-amber-400/5";
      case "preview":
        return "text-cyan-400 border-cyan-400/30 bg-cyan-400/5";
      case "delete":
        return "text-red-400 border-red-400/30 bg-red-400/5";
      case "note":
        return "text-purple-400 border-purple-400/30 bg-purple-400/5";
      case "join":
      case "leave":
      default:
        return "text-muted border-border bg-card";
    }
  };

  return (
    <div className="flex flex-col border-t border-border bg-card/40">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">
            Security Feed
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted">Realtime</span>
      </div>

      {/* Log Entries */}
      <div className="max-h-48 min-h-[120px] overflow-y-auto p-3 space-y-2 font-mono text-[10px] no-scrollbar">
        {entries.length === 0 ? (
          <p className="text-muted/60 text-center py-4">No events logged yet</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-2 leading-relaxed break-words"
            >
              <span className="text-muted/60 shrink-0 font-mono">
                [{entry.timestamp}]
              </span>
              <span
                className={`px-1 rounded-none border text-[9px] font-mono uppercase shrink-0 ${getTypeBadgeColor(
                  entry.type
                )}`}
              >
                {entry.type}
              </span>
              <span className="text-foreground/90 flex-1">{entry.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

/**
 * Helper to emit an audit log broadcast event from anywhere in the room client code.
 */
export function emitAuditEvent(
  roomId: string,
  type: AuditLogEntry["type"],
  message: string
) {
  try {
    const channel = supabase.channel(`room-audit:${roomId}`);
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.send({
          type: "broadcast",
          event: "audit_event",
          payload: { type, message },
        });
      }
    });
  } catch (err) {
    console.error("Failed to emit audit event:", err);
  }
}
