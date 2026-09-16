export type StorageProvider = "supabase" | "r2";

export interface StorageDeleteResult {
  success: boolean;
  error?: string;
  alreadyGone?: boolean;
}

export interface StorageDownloadUrlResult {
  url: string | null;
  error?: string;
}
