"use server";

import { createServerClient } from "@/lib/supabase/server";
import { noteSchema } from "@/lib/validations";

export async function updateNote(
  roomId: string,
  content: string,
  username: string
) {
  const parsed = noteSchema.safeParse(content);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
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

export async function getNote(roomId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("room_id", roomId)
    .single();

  if (error) {
    return null;
  }

  return data;
}
