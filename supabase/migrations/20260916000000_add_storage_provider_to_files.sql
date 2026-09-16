-- ============================================
-- Add storage_provider column to files table
-- Enables Cloudflare R2 migration while preserving existing Supabase storage files
-- ============================================

ALTER TABLE files
ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'supabase'
  CHECK (storage_provider IN ('supabase', 'r2'));

-- Create index on storage_provider if helpful for provider-specific queries
CREATE INDEX IF NOT EXISTS idx_files_storage_provider ON files(storage_provider);
