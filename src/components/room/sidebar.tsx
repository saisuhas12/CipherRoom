"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ExpiryCountdown } from "./expiry-countdown";

interface SidebarProps {
  roomId: string;
  roomName: string;
  roomSlug: string;
  roomExpiresAt: string;
  roomCreatedBy: string;
  username: string;
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
  isOpen = false,
  onClose,
}: SidebarProps) {
  const [onlineCount, setOnlineCount] = useState(0);

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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/room/${roomSlug}`;
    navigator.clipboard.writeText(url);
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

      {/* Actions */}
      <div className="p-4 mt-auto border-t border-border space-y-2">
        <button
          onClick={handleCopyLink}
          className="w-full py-2 text-xs font-mono text-muted border border-border hover:border-accent hover:text-accent transition-colors"
        >
          Copy Room Link
        </button>
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
