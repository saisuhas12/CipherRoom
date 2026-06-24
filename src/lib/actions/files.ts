"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getFiles(roomId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch files:", error);
    return [];
  }

  return data || [];
}

export async function deleteFile(fileId: string, roomId: string) {
  const supabase = createServerClient();

  // Get file record
  const { data: file } = await supabase
    .from("files")
    .select("storage_path")
    .eq("id", fileId)
    .eq("room_id", roomId)
    .single();

  if (!file) {
    return { error: "File not found." };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("room-files")
    .remove([file.storage_path]);

  if (storageError) {
    console.error("Failed to delete file from storage:", storageError);
  }

  // Delete from database
  const { error } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId);

  if (error) {
    console.error("Failed to delete file record:", error);
    return { error: "Failed to delete file." };
  }

  return { success: true };
}

export async function getSignedUrl(storagePath: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase.storage
    .from("room-files")
    .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry

  if (error) {
    console.error("Failed to create signed URL:", error);
    return null;
  }

  return data.signedUrl;
}
