"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { updateNote, getNote } from "@/lib/actions/notes";
import { emitAuditEvent } from "@/components/room/audit-log";

interface NotesProps {
  roomId: string;
  username: string;
}

export function Notes({ roomId, username }: NotesProps) {
  const [content, setContent] = useState("");
  const [lastSavedBy, setLastSavedBy] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalChange = useRef(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load initial note
  useEffect(() => {
    getNote(roomId).then((note) => {
      if (note) {
        setContent(note.content);
        setLastSavedBy(note.updated_by);
      }
    });
  }, [roomId]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`room-notes:${roomId}`)
      .on("broadcast", { event: "note_update" }, (payload) => {
        // Only update if the change came from another user
        if (!isLocalChange.current) {
          const updated = payload.payload as { content: string; updated_by: string };
          if (updated) {
            setContent(updated.content);
            setLastSavedBy(updated.updated_by);
          }
        }
        isLocalChange.current = false;
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const saveNote = useCallback(
    async (text: string) => {
      setIsSaving(true);
      isLocalChange.current = true;
      const result = await updateNote(roomId, text, username);
      setIsSaving(false);

      if (!result.error) {
        setLastSavedAt(new Date());
        setLastSavedBy(username);
        emitAuditEvent(roomId, "note", `${username} edited the shared note`);

        channelRef.current?.send({
          type: "broadcast",
          event: "note_update",
          payload: { content: text, updated_by: username },
        });
      }
    },
    [roomId, username]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Debounce save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveNote(newContent);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted">Shared Notes</span>
          {isSaving && (
            <span className="text-xs font-mono text-accent animate-pulse">
              Saving...
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted">
          {lastSavedBy && <span>Last edit by {lastSavedBy}</span>}
          {lastSavedAt && (
            <span>
              {lastSavedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing... Notes are shared with everyone in the room and saved automatically."
        maxLength={50000}
        className="flex-1 w-full bg-transparent text-foreground text-sm font-mono p-4 resize-none focus:outline-none placeholder:text-muted/30 leading-relaxed"
        spellCheck={false}
      />

      {/* Character count */}
      <div className="px-4 py-1.5 border-t border-border">
        <p className="text-[10px] font-mono text-muted/50 text-right">
          {content.length.toLocaleString()} / 50,000
        </p>
      </div>
    </div>
  );
}
