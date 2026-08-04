-- ============================================
-- CipherRoom Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================
-- TABLES
-- ============================================

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  failed_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notes table (one per room)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_files_room_id ON files(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Note on Row Level Security (RLS) in Production:
-- By enabling RLS and defining NO policies, all direct public access (via client anon key)
-- is blocked by default. All data access is strictly performed through server actions and
-- API endpoints using the service role client which bypasses RLS policies.
-- Realtime syncing is handled securely using transient WebSocket broadcasts.

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for messages and notes tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- ============================================
-- CLEANUP FUNCTION (OPTIONAL FALLBACK)
-- ============================================

-- NOTE: Primary cleanup is handled at the APPLICATION level:
--   1. createRoom() deletes expired rooms with matching slugs before creating new ones
--   2. joinRoom() and getRoomBySlug() delete expired rooms on detection
--   3. GET /api/cleanup is called by a cron job (Vercel Cron or external) every hour
--
-- The pg_cron function below is an OPTIONAL FALLBACK for additional safety.
-- It requires the pg_net extension and app.supabase_url / app.service_role_key
-- settings, which may not be available on all Supabase plans.

-- Function to delete expired rooms and their storage files
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_room RECORD;
  file_record RECORD;
BEGIN
  -- Loop through expired rooms
  FOR expired_room IN
    SELECT id FROM rooms WHERE expires_at < now()
  LOOP
    -- Delete files from storage for this room
    FOR file_record IN
      SELECT storage_path FROM files WHERE room_id = expired_room.id
    LOOP
      -- Storage cleanup happens via cascade + storage lifecycle rules
      -- Files in the bucket with matching paths will be cleaned
      PERFORM net.http_delete(
        url := current_setting('app.supabase_url') || '/storage/v1/object/room-files/' || file_record.storage_path,
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
          'apikey', current_setting('app.service_role_key')
        )
      );
    END LOOP;

    -- Delete the room (cascades to messages, notes, files)
    DELETE FROM rooms WHERE id = expired_room.id;
  END LOOP;
END;
$$;

-- Schedule cleanup every hour (requires pg_cron)
-- Note: If pg_cron is not available, the app-level /api/cleanup endpoint handles this
SELECT cron.schedule(
  'cleanup-expired-rooms',
  '0 * * * *',  -- Every hour
  'SELECT cleanup_expired_rooms()'
);

-- ============================================
-- GLOBAL STATS & COUNTERS
-- ============================================

CREATE TABLE IF NOT EXISTS global_stats (
  id INT PRIMARY KEY DEFAULT 1,
  total_rooms BIGINT DEFAULT 0,
  total_files BIGINT DEFAULT 0
);

-- Ensure default single row exists
INSERT INTO global_stats (id, total_rooms, total_files)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS global_countries (
  country_code TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on stats tables (service role bypasses RLS)
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_countries ENABLE ROW LEVEL SECURITY;

-- Function to safely increment room count and record unique country
CREATE OR REPLACE FUNCTION increment_room_count(user_country TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO global_stats (id, total_rooms, total_files) VALUES (1, 1, 0)
  ON CONFLICT (id) DO UPDATE SET total_rooms = global_stats.total_rooms + 1;

  IF user_country IS NOT NULL AND user_country != '' AND user_country != 'UNKNOWN' THEN
    INSERT INTO global_countries (country_code) VALUES (UPPER(user_country))
    ON CONFLICT (country_code) DO NOTHING;
  END IF;
END;
$$;

-- Function to safely increment file count
CREATE OR REPLACE FUNCTION increment_file_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO global_stats (id, total_rooms, total_files) VALUES (1, 0, 1)
  ON CONFLICT (id) DO UPDATE SET total_files = global_stats.total_files + 1;
END;
$$;

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for room files
-- Run this via Supabase Dashboard or API:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit)
-- VALUES ('room-files', 'room-files', false, 104857600);
-- 104857600 = 100MB

