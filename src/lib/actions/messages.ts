"use server";

import { createServerClient } from "@/lib/supabase/server";
import { messageSchema } from "@/lib/validations";

export async function sendMessage(
  roomId: string,
  username: string,
  content: string
) {
  const parsed = messageSchema.safeParse(content);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createServerClient();

  // Verify room exists and hasn't expired
  const { data: room } = await supabase
    .from("rooms")
    .select("id, expires_at")
    .eq("id", roomId)
    .single();

  if (!room || new Date(room.expires_at) < new Date()) {
    return { error: "Room not found or expired." };
  }

  const { error } = await supabase.from("messages").insert({
    room_id: roomId,
    username,
    content: parsed.data,
  });

  if (error) {
    console.error("Failed to send message:", error);
    return { error: "Failed to send message." };
  }

  return { success: true };
}

export async function getMessages(roomId: string) {
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

  return data || [];
}
