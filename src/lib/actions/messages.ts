"use server";

import { createServerClient } from "@/lib/supabase/server";
import { messageSchema, sanitizeInput } from "@/lib/validations";
import type { Message } from "@/lib/supabase/types";
import { headers } from "next/headers";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { verifyRoomAccess } from "@/lib/auth";

export async function sendMessage(
  roomId: string,
  username: string,
  content: string
) {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  // Rate Limit
  const rateLimitResult = await rateLimit(ip, RATE_LIMITS.messageSend);
  if (!rateLimitResult.success) {
    return { error: "Too many messages. Please try again later." };
  }

  // Authorize room access
  if (!(await verifyRoomAccess(roomId))) {
    return { error: "Unauthorized access to room." };
  }

  const parsed = messageSchema.safeParse(content);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return { error: msg };
  }

  const supabase = createServerClient();

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      room_id: roomId,
      username: sanitizeInput(username),
      content: sanitizeInput(parsed.data),
    })
    .select()
    .single();

  if (error || !message) {
    console.error("Failed to send message:", error);
    return { error: "Failed to send message." };
  }

  return { success: true, message: message as Message };
}

export async function getMessages(roomId: string): Promise<Message[]> {
  // Authorize room access
  if (!(await verifyRoomAccess(roomId))) {
    return [];
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }

  return (data || []) as Message[];
}

// ============================================
// 24/7 GLOBAL PUBLIC CHAT ACTIONS
// ============================================

const PUBLIC_ROOM_SLUG = "global-chat";

/**
 * Ensures the 24/7 Global Public room exists in Supabase.
 * Uses a far-future expiry date so the room itself is never purged.
 */
export async function getOrCreatePublicRoom() {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("rooms")
    .select("id, name, slug, created_at")
    .eq("slug", PUBLIC_ROOM_SLUG)
    .single();

  if (existing) {
    return existing;
  }

  // Create public lobby room if missing
  const { data: created, error } = await supabase
    .from("rooms")
    .insert({
      name: "Global Lobby",
      slug: PUBLIC_ROOM_SLUG,
      password_hash: "PUBLIC_ROOM_NO_PASSWORD",
      created_by: "system",
      expires_at: new Date("2099-12-31T23:59:59Z").toISOString(),
    })
    .select("id, name, slug, created_at")
    .single();

  if (error) {
    // In case another worker created it concurrently
    const { data: fallback } = await supabase
      .from("rooms")
      .select("id, name, slug, created_at")
      .eq("slug", PUBLIC_ROOM_SLUG)
      .single();
    return fallback;
  }

  return created;
}

/**
 * Fetches recent public messages and purges messages older than 24 hours.
 */
export async function getPublicMessages(): Promise<Message[]> {
  const supabase = createServerClient();
  const room = await getOrCreatePublicRoom();
  if (!room) return [];

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Eagerly delete messages older than 24 hours in the public room
  await supabase
    .from("messages")
    .delete()
    .eq("room_id", room.id)
    .lt("created_at", cutoff);

  // Fetch remaining messages sent within the last 24 hours
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", room.id)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Failed to fetch public messages:", error);
    return [];
  }

  return (data || []) as Message[];
}

/**
 * Sends a message in the 24/7 Global Public chat.
 */
export async function sendPublicMessage(username: string, content: string) {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  // Rate limit
  const rateLimitResult = await rateLimit(ip, RATE_LIMITS.messageSend);
  if (!rateLimitResult.success) {
    return { error: "Too many messages. Please slow down." };
  }

  const parsed = messageSchema.safeParse(content);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return { error: msg };
  }

  const room = await getOrCreatePublicRoom();
  if (!room) {
    return { error: "Global chat room is currently unavailable." };
  }

  const supabase = createServerClient();

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      room_id: room.id,
      username: sanitizeInput(username),
      content: sanitizeInput(parsed.data),
    })
    .select()
    .single();

  if (error || !message) {
    console.error("Failed to send public message:", error);
    return { error: "Failed to send message." };
  }

  return { success: true, message: message as Message, roomId: room.id };
}

/**
 * Cleans up messages in the public room older than 24 hours.
 * Called by the cleanup cron endpoint.
 */
export async function cleanupExpiredPublicMessages() {
  const supabase = createServerClient();
  const room = await getOrCreatePublicRoom();
  if (!room) return;

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from("messages")
    .delete()
    .eq("room_id", room.id)
    .lt("created_at", cutoff);
}
