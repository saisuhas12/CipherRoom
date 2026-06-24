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

-- Allow all operations via service role (server-side)
-- Public access is controlled through API routes / server actions

CREATE POLICY "Allow all for service role" ON rooms
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON messages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON notes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON files
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for messages and notes tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- ============================================
-- CLEANUP FUNCTION
-- ============================================

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
-- Note: If pg_cron is not available, use a Supabase Edge Function cron instead
SELECT cron.schedule(
  'cleanup-expired-rooms',
  '0 * * * *',  -- Every hour
  'SELECT cleanup_expired_rooms()'
);

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for room files
-- Run this via Supabase Dashboard or API:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit)
-- VALUES ('room-files', 'room-files', false, 104857600);
-- 104857600 = 100MB
