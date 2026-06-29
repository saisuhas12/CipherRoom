"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { FileRecord } from "@/lib/supabase/types";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/rate-limit";
import { verifyRoomAccess } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";

export async function getFiles(roomId: string): Promise<FileRecord[]> {
  // Authorize room access
  if (!(await verifyRoomAccess(roomId))) {
    return [];
  }

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

  return (data || []) as FileRecord[];
}

export async function deleteFile(fileId: string, roomId: string) {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  // Authorize room access
  if (!(await verifyRoomAccess(roomId))) {
    return { error: "Unauthorized access to room." };
  }

  const supabase = createServerClient();

  // Get file record
  const { data: file } = await supabase
    .from("files")
    .select("storage_path, original_name")
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

  logSecurityEvent("file_deleted", ip, {
    roomId,
    fileId,
    filename: file.original_name,
  });

  return { success: true };
}

export async function getSignedUrl(storagePath: string) {
  const supabase = createServerClient();

  // Get file record to find roomId and filename for audit logging
  const { data: file } = await supabase
    .from("files")
    .select("room_id, id, original_name")
    .eq("storage_path", storagePath)
    .single();

  if (!file || !(await verifyRoomAccess(file.room_id))) {
    return null;
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  const { data, error } = await supabase.storage
    .from("room-files")
    .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry

  if (error) {
    console.error("Failed to create signed URL:", error);
    return null;
  }

  logSecurityEvent("file_download", ip, {
    roomId: file.room_id,
    fileId: file.id,
    filename: file.original_name,
  });

  return data.signedUrl;
}
