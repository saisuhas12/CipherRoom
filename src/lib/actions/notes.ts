"use server";

import { createServerClient } from "@/lib/supabase/server";
import { noteSchema } from "@/lib/validations";
import type { Note } from "@/lib/supabase/types";

export async function updateNote(
  roomId: string,
  content: string,
  username: string
) {
  const parsed = noteSchema.safeParse(content);
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return { error: msg };
  }

  const supabase = createServerClient();

  // Upsert note
  const { error } = await supabase
    .from("notes")
    .update({
      content: parsed.data,
      updated_by: username,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", roomId);

  if (error) {
    // If no row to update, insert
    const { error: insertError } = await supabase.from("notes").insert({
      room_id: roomId,
      content: parsed.data,
      updated_by: username,
    });

    if (insertError) {
      console.error("Failed to update note:", insertError);
      return { error: "Failed to update note." };
    }
  }

  return { success: true };
}

export async function getNote(roomId: string): Promise<Note | null> {
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
