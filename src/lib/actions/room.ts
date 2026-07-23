"use server";

import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase/server";
import { createRoomSchema, joinRoomSchema } from "@/lib/validations";
import { generateSlug, getAppUrl } from "@/lib/utils";
import { headers } from "next/headers";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { setRoomSession } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";

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
  const pathsToDelete: Set<string> = new Set();

  // 1. Get file storage paths from DB table
  const { data: dbFiles } = await supabase
    .from("files")
    .select("storage_path")
    .eq("room_id", roomId);

  if (dbFiles) {
    dbFiles.forEach((f) => {
      if (f.storage_path) pathsToDelete.add(f.storage_path);
    });
  }

  // 2. Also list files directly from storage bucket folder to catch any DB-orphaned files
  const { data: storageFiles } = await supabase.storage
    .from("room-files")
    .list(roomId);

  if (storageFiles && storageFiles.length > 0) {
    storageFiles.forEach((file) => {
      if (file.name && file.name !== ".emptyFolderPlaceholder") {
        pathsToDelete.add(`${roomId}/${file.name}`);
      }
    });
  }

  // 3. Remove all files from bucket
  if (pathsToDelete.size > 0) {
    const { error } = await supabase.storage
      .from("room-files")
      .remove(Array.from(pathsToDelete));

    if (error) {
      console.error(`Failed to remove storage files for room ${roomId}:`, error);
    }
  }
}

/**
 * Deletes a single expired room: cleans storage files, then deletes
 * the room row (which cascades to messages, notes, files tables).
 */
async function cleanupExpiredRoom(
  supabase: ReturnType<typeof createServerClient>,
  roomId: string
) {
  // Retrieve room details for logging
  const { data: room } = await supabase
    .from("rooms")
    .select("slug")
    .eq("id", roomId)
    .single();
  const slug = room?.slug || "unknown";

  await cleanupRoomStorage(supabase, roomId);
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) {
    console.error(`Failed to delete room ${roomId}:`, error);
  } else {
    logSecurityEvent("room_deleted", "system", { roomId, slug, reason: "expired" });
  }
}

/**
 * Finds and deletes ALL expired rooms and orphaned storage folders.
 * Called by the cron API endpoint.
 */
export async function cleanupAllExpiredRooms() {
  const supabase = createServerClient();

  // 1. Clean up expired rooms in DB
  const { data: expiredRooms, error } = await supabase
    .from("rooms")
    .select("id")
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error("Failed to query expired rooms:", error);
    return { error: "Failed to query expired rooms." };
  }

  let cleaned = 0;
  if (expiredRooms && expiredRooms.length > 0) {
    for (const room of expiredRooms) {
      await cleanupExpiredRoom(supabase, room.id);
      cleaned++;
    }
  }

  // 2. Scan storage bucket for orphaned folders (folders with no active room in DB)
  const { data: storageFolders } = await supabase.storage
    .from("room-files")
    .list();

  if (storageFolders && storageFolders.length > 0) {
    for (const folder of storageFolders) {
      if (!folder.id && folder.name) {
        // folder.name is the roomId
        const roomId = folder.name;

        // Check if an active (non-expired) room exists for this folder ID
        const { data: activeRoom } = await supabase
          .from("rooms")
          .select("id, expires_at")
          .eq("id", roomId)
          .maybeSingle();

        const isExpiredOrMissing =
          !activeRoom || new Date(activeRoom.expires_at) < new Date();

        if (isExpiredOrMissing) {
          await cleanupRoomStorage(supabase, roomId);
          // If room row still exists, delete it
          if (activeRoom) {
            await supabase.from("rooms").delete().eq("id", roomId);
          }
          cleaned++;
        }
      }
    }
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
  const headersList = await headers();
  const ip = getClientIp(headersList);

  // Rate Limit
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.roomCreate);
  if (!rateLimitResult.success) {
    return { error: "Too many room creations. Please try again later." };
  }

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

  logSecurityEvent("room_created", ip, {
    roomId: room.id,
    slug: room.slug,
    name: room.name,
    expiresAt: room.expires_at,
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
  const headersList = await headers();
  const ip = getClientIp(headersList);

  // Rate Limit
  const rateLimitResult = rateLimit(ip, RATE_LIMITS.roomJoin);
  if (!rateLimitResult.success) {
    return { error: "Too many login attempts. Please try again later." };
  }

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
    logSecurityEvent("room_expired_access", ip, { slug });
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
      logSecurityEvent("room_locked", ip, { slug, roomId: room.id });
    } else {
      logSecurityEvent("room_join_failed", ip, {
        slug,
        roomId: room.id,
        reason: "wrong_password",
        attempts: newAttempts,
      });
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
  if (room.failed_attempts > 0 || room.locked_until) {
    await supabase
      .from("rooms")
      .update({ failed_attempts: 0, locked_until: null })
      .eq("id", room.id);
  }

  // Set signed cookie session
  await setRoomSession(room.id, room.slug, room.expires_at);

  logSecurityEvent("room_join_success", ip, { slug, roomId: room.id });

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

