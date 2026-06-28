"use server";

import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase/server";
import { createRoomSchema, joinRoomSchema } from "@/lib/validations";
import { generateSlug, getAppUrl } from "@/lib/utils";

// ============================================
// CLEANUP HELPERS
// ============================================

/**
 * Deletes all files from Supabase Storage for a given room.
 * Must be called BEFORE deleting the room row (since files table cascades).
 */
async function cleanupRoomStorage(
  supabase: ReturnType<typeof createServerClient>,
  roomId: string
) {
  // Get all file storage paths for this room
  const { data: files } = await supabase
    .from("files")
    .select("storage_path")
    .eq("room_id", roomId);

  if (files && files.length > 0) {
    const paths = files.map((f) => f.storage_path);
    // Supabase storage .remove() accepts an array of paths
    const { error } = await supabase.storage
      .from("room-files")
      .remove(paths);

    if (error) {
      console.error(`Failed to remove storage files for room ${roomId}:`, error);
    }
  }

  // Also try to remove the room folder itself (in case of orphan files)
  await supabase.storage.from("room-files").remove([`${roomId}/`]);
}

/**
 * Deletes a single expired room: cleans storage files, then deletes
 * the room row (which cascades to messages, notes, files tables).
 */
async function cleanupExpiredRoom(
  supabase: ReturnType<typeof createServerClient>,
  roomId: string
) {
  await cleanupRoomStorage(supabase, roomId);
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) {
    console.error(`Failed to delete room ${roomId}:`, error);
  }
}

/**
 * Finds and deletes ALL expired rooms (and their storage files).
 * Called by the cron API endpoint.
 */
export async function cleanupAllExpiredRooms() {
  const supabase = createServerClient();

  const { data: expiredRooms, error } = await supabase
    .from("rooms")
    .select("id")
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error("Failed to query expired rooms:", error);
    return { error: "Failed to query expired rooms." };
  }

  if (!expiredRooms || expiredRooms.length === 0) {
    return { success: true, cleaned: 0 };
  }

  let cleaned = 0;
  for (const room of expiredRooms) {
    await cleanupExpiredRoom(supabase, room.id);
    cleaned++;
  }

  return { success: true, cleaned };
}

/**
 * Deletes a specific expired room by slug. Called from the client-side
 * room page when it detects the room has expired.
 */
export async function deleteExpiredRoomBySlug(slug: string) {
  const supabase = createServerClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, expires_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!room) return; // Already gone

  // Only delete if truly expired (safety check)
  if (new Date(room.expires_at) < new Date()) {
    await cleanupExpiredRoom(supabase, room.id);
  }
}

// ============================================
// ROOM ACTIONS
// ============================================

export async function createRoom(formData: {
  name: string;
  password: string;
  expiryHours: string;
  username: string;
}) {
  const parsed = createRoomSchema.safeParse({
    name: formData.name,
    password: formData.password,
    expiryHours: formData.expiryHours,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return { error: msg };
  }

  const supabase = createServerClient();
  const { name, password, expiryHours } = parsed.data;

  // Hash password with cost factor 12
  const passwordHash = await bcrypt.hash(password, 12);

  // Generate unique slug with collision handling
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let suffix = 0;

  while (true) {
    const { data: existing } = await supabase
      .from("rooms")
      .select("id, expires_at")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;

    // If the existing room has expired, delete it and reuse the slug
    if (new Date(existing.expires_at) < new Date()) {
      await cleanupExpiredRoom(supabase, existing.id);
      break; // Slug is now free
    }

    // Active room occupies this slug — try next suffix
    suffix++;
    slug = `${baseSlug}-${suffix}`;
  }

  // Calculate expiry
  const expiresAt = new Date(
    Date.now() + parseInt(expiryHours) * 60 * 60 * 1000
  ).toISOString();

  // Create room
  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      name,
      slug,
      password_hash: passwordHash,
      created_by: formData.username,
      expires_at: expiresAt,
    })
    .select("id, slug, name, expires_at")
    .single();

  if (error || !room) {
    console.error("Failed to create room:", error);
    return { error: "Failed to create room. Please try again." };
  }

  // Create empty note for the room
  await supabase.from("notes").insert({
    room_id: room.id,
    content: "",
    updated_by: formData.username,
  });

  return {
    success: true,
    room: {
      id: room.id as string,
      slug: room.slug as string,
      name: room.name as string,
      expiresAt: room.expires_at as string,
      url: `${getAppUrl()}/room/${room.slug}`,
    },
  };
}

export async function joinRoom(formData: {
  slug: string;
  password: string;
}) {
  const parsed = joinRoomSchema.safeParse(formData);

  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message ?? "Validation failed";
    return { error: msg };
  }

  const supabase = createServerClient();
  const { slug, password } = parsed.data;

  // Fetch room
  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !room) {
    return { error: "Room not found." };
  }

  // Check if room has expired — if so, clean it up
  if (new Date(room.expires_at) < new Date()) {
    await cleanupExpiredRoom(supabase, room.id);
    return { error: "This room has expired and has been deleted." };
  }

  // Check if room is locked
  if (room.locked_until && new Date(room.locked_until) > new Date()) {
    const remainingMs = new Date(room.locked_until).getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    return {
      error: `Too many failed attempts. Room is locked for ${remainingMin} minute${remainingMin !== 1 ? "s" : ""}.`,
    };
  }

  // Verify password
  const isValid = await bcrypt.compare(password, room.password_hash);

  if (!isValid) {
    // Increment failed attempts
    const newAttempts = (room.failed_attempts || 0) + 1;
    const updateData: Record<string, unknown> = {
      failed_attempts: newAttempts,
    };

    // Lock after 5 failed attempts
    if (newAttempts >= 5) {
      updateData.locked_until = new Date(
        Date.now() + 5 * 60 * 1000
      ).toISOString();
      updateData.failed_attempts = 0;
    }

    await supabase.from("rooms").update(updateData).eq("id", room.id);

    const remaining = 5 - newAttempts;
    if (remaining > 0) {
      return {
        error: `Incorrect password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      };
    }
    return {
      error: "Too many failed attempts. Room is locked for 5 minutes.",
    };
  }

  // Reset failed attempts on successful login
  if (room.failed_attempts > 0) {
    await supabase
      .from("rooms")
      .update({ failed_attempts: 0, locked_until: null })
      .eq("id", room.id);
  }

  return {
    success: true,
    room: {
      id: room.id as string,
      slug: room.slug as string,
      name: room.name as string,
      expiresAt: room.expires_at as string,
      createdBy: room.created_by as string,
      createdAt: room.created_at as string,
    },
  };
}

export async function getRoomBySlug(slug: string) {
  const supabase = createServerClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .select("id, name, slug, expires_at, created_by, created_at")
    .eq("slug", slug)
    .single();

  if (error || !room) {
    return null;
  }

  // If room is expired, clean it up and return null (as if not found)
  if (new Date(room.expires_at) < new Date()) {
    await cleanupExpiredRoom(supabase, room.id);
    return null;
  }

  return room;
}
