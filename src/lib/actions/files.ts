"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { FileRecord } from "@/lib/supabase/types";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/rate-limit";
import { verifyRoomAccess } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";
import { getStorageDownloadUrl, deleteStorageObject } from "@/lib/storage";

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

  // Get file record scoped strictly to verified room_id
  const { data: file } = await supabase
    .from("files")
    .select("storage_path, storage_provider, original_name")
    .eq("id", fileId)
    .eq("room_id", roomId)
    .single();

  if (!file) {
    return { error: "File not found." };
  }

  // Delete from storage provider (idempotent)
  const storageResult = await deleteStorageObject(
    file.storage_provider,
    file.storage_path
  );

  if (!storageResult.success) {
    console.error(
      `Failed to delete file from ${file.storage_provider} (${file.storage_path}):`,
      storageResult.error
    );
  }

  // Delete from database
  const { error } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId)
    .eq("room_id", roomId);

  if (error) {
    console.error("Failed to delete file record:", error);
    return { error: "Failed to delete file." };
  }

  logSecurityEvent("file_deleted", ip, {
    roomId,
    fileId,
    filename: file.original_name,
    provider: file.storage_provider,
  });

  return { success: true };
}

/**
 * Generates a signed/presigned download URL for a file.
 * Scoped strictly to verified room_id and fileId.
 */
export async function getSignedUrl(fileId: string, roomId: string) {
  // Authorize room access
  if (!(await verifyRoomAccess(roomId))) {
    return null;
  }

  const supabase = createServerClient();

  // Query file row scoped strictly to roomId
  const { data: file } = await supabase
    .from("files")
    .select("id, room_id, original_name, storage_path, storage_provider")
    .eq("id", fileId)
    .eq("room_id", roomId)
    .single();

  if (!file) {
    return null;
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);

  const signedUrl = await getStorageDownloadUrl(
    file.storage_provider,
    file.storage_path,
    60 * 60 // 1 hour expiry
  );

  if (!signedUrl) {
    console.error(
      `Failed to create download URL for file ${fileId} on provider ${file.storage_provider}`
    );
    return null;
  }

  logSecurityEvent("file_download", ip, {
    roomId: file.room_id,
    fileId: file.id,
    filename: file.original_name,
    provider: file.storage_provider,
  });

  return signedUrl;
}

