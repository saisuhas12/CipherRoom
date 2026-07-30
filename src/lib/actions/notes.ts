"use server";

import { createServerClient } from "@/lib/supabase/server";
import { noteSchema, sanitizeInput } from "@/lib/validations";
import type { Note } from "@/lib/supabase/types";
import { headers } from "next/headers";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { verifyRoomAccess } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";

export async function updateNote(
  roomId: string,
  content: string,
  username: string
) {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  // Rate Limit
  const rateLimitResult = await rateLimit(ip, RATE_LIMITS.noteUpdate);
  if (!rateLimitResult.success) {
    return { error: "Too many note updates. Please try again later." };
  }

  // Authorize room access
  if (!(await verifyRoomAccess(roomId))) {
    return { error: "Unauthorized access to room." };
  }

  const parsed = noteSchema.safeParse(content);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return { error: msg };
  }

  const sanitizedContent = sanitizeInput(parsed.data);
  const sanitizedUsername = sanitizeInput(username);
  const supabase = createServerClient();

  // Upsert note
  const { error } = await supabase
    .from("notes")
    .update({
      content: sanitizedContent,
      updated_by: sanitizedUsername,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId);

  if (error) {
    // If no row to update, insert
    const { error: insertError } = await supabase.from("notes").insert({
      room_id: roomId,
      content: sanitizedContent,
      updated_by: sanitizedUsername,
    });

    if (insertError) {
      console.error("Failed to update note:", insertError);
      return { error: "Failed to update note." };
    }
  }

  logSecurityEvent("note_edit", ip, {
    roomId,
    username,
    length: parsed.data.length,
  });

  return { success: true };
}

export async function getNote(roomId: string): Promise<Note | null> {
  // Authorize room access
  if (!(await verifyRoomAccess(roomId))) {
    return null;
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("room_id", roomId)
    .single();

  if (error) {
    return null;
  }

  return data as Note;
}
