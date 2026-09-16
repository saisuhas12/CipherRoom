import { createServerClient } from "@/lib/supabase/server";
import type { StorageDeleteResult } from "./types";

const BUCKET_NAME = "room-files";

/**
 * Generate a signed download URL from Supabase Storage for legacy files.
 * Default expiry: 3600 seconds (1 hour).
 */
export async function createSupabaseSignedDownloadUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    console.error("[Supabase Storage] Failed to create signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Delete a specific object from Supabase Storage.
 * Idempotent.
 */
export async function deleteSupabaseObject(
  storagePath: string
): Promise<StorageDeleteResult> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error(`[Supabase Storage] Delete failed for ${storagePath}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Supabase Storage] Delete exception for ${storagePath}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete all files in a Supabase Storage folder (e.g. `${roomId}`).
 */
export async function deleteSupabasePrefix(
  roomId: string
): Promise<{ deletedCount: number; errors: string[] }> {
  const supabase = createServerClient();
  const errors: string[] = [];
  let deletedCount = 0;

  try {
    const { data: storageFiles, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(roomId);

    if (listError) {
      errors.push(`Failed to list folder ${roomId}: ${listError.message}`);
      return { deletedCount, errors };
    }

    if (storageFiles && storageFiles.length > 0) {
      const pathsToDelete = storageFiles
        .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
        .map((f) => `${roomId}/${f.name}`);

      if (pathsToDelete.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove(pathsToDelete);

        if (removeError) {
          errors.push(`Failed to remove folder contents ${roomId}: ${removeError.message}`);
        } else {
          deletedCount += pathsToDelete.length;
        }
      }
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    errors.push(errorMessage);
  }

  return { deletedCount, errors };
}
