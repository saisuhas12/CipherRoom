"use server";

import { createServerClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validations";
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
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.messageSend);
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
      username,
      content: parsed.data,
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
