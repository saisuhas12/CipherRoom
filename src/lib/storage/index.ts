import type { StorageProvider, StorageDeleteResult } from "./types";
import {
  createR2PresignedDownloadUrl,
  createR2PresignedUploadUrl,
  deleteR2Object,
  deleteR2Prefix,
  checkR2ObjectExists,
} from "./r2";
import {
  createSupabaseSignedDownloadUrl,
  deleteSupabaseObject,
  deleteSupabasePrefix,
} from "./supabase-storage";

export * from "./types";
export {
  createR2PresignedUploadUrl,
  createR2PresignedDownloadUrl,
  deleteR2Object,
  deleteR2Prefix,
  checkR2ObjectExists,
  createSupabaseSignedDownloadUrl,
  deleteSupabaseObject,
  deleteSupabasePrefix,
};

/**
 * Get a presigned / signed download URL for a file, dispatched by provider.
 */
export async function getStorageDownloadUrl(
  provider: StorageProvider,
  storagePath: string,
  expiresIn = 3600
): Promise<string | null> {
  if (provider === "r2") {
    try {
      return await createR2PresignedDownloadUrl(storagePath, expiresIn);
    } catch (err) {
      console.error("[Storage] Failed to generate R2 download URL:", err);
      return null;
    }
  }

  if (provider === "supabase") {
    return await createSupabaseSignedDownloadUrl(storagePath, expiresIn);
  }

  return null;
}

/**
 * Delete a file from its respective storage provider.
 */
export async function deleteStorageObject(
  provider: StorageProvider,
  storagePath: string
): Promise<StorageDeleteResult> {
  if (provider === "r2") {
    return await deleteR2Object(storagePath);
  }

  if (provider === "supabase") {
    return await deleteSupabaseObject(storagePath);
  }

  return { success: false, error: `Unknown storage provider: ${provider}` };
}
