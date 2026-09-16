"use server";

import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase/server";
import { createRoomSchema, joinRoomSchema, sanitizeInput } from "@/lib/validations";
import { generateSlug, getAppUrl } from "@/lib/utils";
import { headers } from "next/headers";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { setRoomSession } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";
import { recordRoomCreated } from "@/lib/actions/stats";

import {
  deleteStorageObject,
  deleteR2Prefix,
  deleteSupabasePrefix,
} from "@/lib/storage";
import type { StorageProvider } from "@/lib/storage";

// ============================================
// CLEANUP HELPERS
// ============================================

/**
 * Deletes all storage objects (both R2 and Supabase) associated with a given room.
 * Safely verifies every file deletion before returning success.
 */
async function cleanupRoomStorage(
  supabase: ReturnType<typeof createServerClient>,
  roomId: string
): Promise<{ success: boolean; filesAttempted: number; errors: string[] }> {
  const errors: string[] = [];
  let allFilesDeleted = true;

  // 1. Fetch all DB file records for this room
  const { data: dbFiles, error: fetchError } = await supabase
    .from("files")
    .select("id, storage_path, storage_provider, original_name")
    .eq("room_id", roomId);

  if (fetchError) {
    errors.push(`Failed to fetch files from DB: ${fetchError.message}`);
    return { success: false, filesAttempted: 0, errors };
  }

  const files = (dbFiles || []) as Array<{
    id: string;
    storage_path: string;
    storage_provider: StorageProvider;
    original_name: string;
  }>;

  // 2. Delete each tracked file object from its respective provider
  for (const file of files) {
    try {
      const result = await deleteStorageObject(
        file.storage_provider || "supabase",
        file.storage_path
      );

      if (!result.success && !result.alreadyGone) {
        allFilesDeleted = false;
        const msg = `Failed to delete file ${file.id} (${file.original_name}) from ${file.storage_provider}: ${result.error}`;
        console.error(`[CLEANUP] ${msg}`);
        errors.push(msg);
      }
    } catch (err) {
      allFilesDeleted = false;
      const msg = `Exception deleting file ${file.id} (${file.storage_path}): ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[CLEANUP] ${msg}`);
      errors.push(msg);
    }
  }

  // 3. Scan & delete any unconfirmed / orphaned stray objects under {roomId}/ in R2
  try {
    const r2StrayResult = await deleteR2Prefix(roomId);
    if (r2StrayResult.errors.length > 0) {
      errors.push(...r2StrayResult.errors);
    }
  } catch (err) {
    console.error(`[CLEANUP] Error scanning stray R2 objects for room ${roomId}:`, err);
  }

  // 4. Scan & delete any legacy Supabase storage folder objects for {roomId}
  try {
    const supabaseStrayResult = await deleteSupabasePrefix(roomId);
    if (supabaseStrayResult.errors.length > 0) {
      errors.push(...supabaseStrayResult.errors);
    }
  } catch (err) {
    console.error(`[CLEANUP] Error scanning Supabase folder for room ${roomId}:`, err);
  }

  return {
    success: allFilesDeleted,
    filesAttempted: files.length,
    errors,
  };
}

/**
 * Deletes a single expired room: cleans storage files across providers,
 * and deletes the room DB row ONLY if all storage files were successfully removed.
 */
async function cleanupExpiredRoom(
  supabase: ReturnType<typeof createServerClient>,
  roomId: string
): Promise<{ success: boolean; error?: string }> {
  // Retrieve room details for logging
  const { data: room } = await supabase
    .from("rooms")
    .select("slug")
    .eq("id", roomId)
    .maybeSingle();
  const slug = room?.slug || "unknown";

  const storageResult = await cleanupRoomStorage(supabase, roomId);

  if (!storageResult.success) {
    console.error(
      `[CLEANUP RETRY REQUIRED] Room ${roomId} (${slug}) file deletion failed. Keeping room record in DB to retry on next run. Errors:`,
      storageResult.errors
    );
    return {
      success: false,
      error: `Storage cleanup incomplete: ${storageResult.errors.join("; ")}`,
    };
  }

  // Only delete room DB row after all storage objects are confirmed deleted / gone
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) {
    console.error(`Failed to delete room DB row ${roomId}:`, error);
    return { success: false, error: error.message };
  }

  logSecurityEvent("room_deleted", "system", {
    roomId,
    slug,
    reason: "expired",
    filesCleaned: storageResult.filesAttempted,
  });

  return { success: true };
}

/**
 * Finds and deletes ALL expired rooms and orphaned storage folders.
 * Safe, idempotent, and retryable. Called by the cron API endpoint.
 */
export async function cleanupAllExpiredRooms() {
  const supabase = createServerClient();

  // 1. Query expired rooms
  const { data: expiredRooms, error } = await supabase
    .from("rooms")
    .select("id, slug, expires_at")
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error("[CLEANUP] Failed to query expired rooms:", error);
    return { error: "Failed to query expired rooms." };
  }

  let cleaned = 0;
  let failed = 0;

  if (expiredRooms && expiredRooms.length > 0) {
    for (const room of expiredRooms) {
      try {
        const result = await cleanupExpiredRoom(supabase, room.id);
        if (result.success) {
          cleaned++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
        console.error(`[CLEANUP] Uncaught error cleaning room ${room.id}:`, err);
      }
    }
  }

  // 2. Observability check for stuck expired rooms
  const { data: remainingExpired } = await supabase
    .from("rooms")
    .select("id, slug, expires_at")
    .lt("expires_at", new Date().toISOString());

  if (remainingExpired && remainingExpired.length > 0) {
    console.warn(
      `[OBSERVABILITY] ${remainingExpired.length} expired room(s) still remain in DB after cleanup run (pending retry):`,
      remainingExpired.map((r) => ({ id: r.id, slug: r.slug, expires_at: r.expires_at }))
    );
  }

  return {
    success: true,
    cleaned,
    failed,
    totalExpired: expiredRooms?.length || 0,
    remainingStuck: remainingExpired?.length || 0,
  };
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
  const rateLimitResult = await rateLimit(ip, RATE_LIMITS.roomCreate);
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

  // Calculate expiry
  const expiresAt = new Date(
    Date.now() + parseInt(expiryHours) * 60 * 60 * 1000
  ).toISOString();

  const sanitizedRoomName = sanitizeInput(name);
  const sanitizedUsername = sanitizeInput(formData.username);

  // Generate unique slug with atomic collision & race condition handling
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let suffix = 0;
  let room: { id: string; slug: string; name: string; expires_at: string } | null = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    const { data: existing } = await supabase
      .from("rooms")
      .select("id, expires_at")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      if (new Date(existing.expires_at) < new Date()) {
        await cleanupExpiredRoom(supabase, existing.id);
      } else {
        suffix++;
        slug = `${baseSlug}-${suffix}`;
        continue;
      }
    }

    const { data: createdRoom, error: insertError } = await supabase
      .from("rooms")
      .insert({
        name: sanitizedRoomName,
        slug,
        password_hash: passwordHash,
        created_by: sanitizedUsername,
        expires_at: expiresAt,
      })
      .select("id, slug, name, expires_at")
      .single();

    if (!insertError && createdRoom) {
      room = createdRoom;
      break;
    }

    // If duplicate slug collision occurred concurrently, increment suffix and retry
    const isDuplicateSlug =
      insertError?.code === "23505" ||
      insertError?.message?.toLowerCase().includes("duplicate") ||
      insertError?.message?.toLowerCase().includes("unique") ||
      insertError?.message?.toLowerCase().includes("slug");

    if (isDuplicateSlug) {
      suffix++;
      slug = `${baseSlug}-${suffix}`;
      continue;
    }

    console.error("Failed to create room:", insertError);
    return { error: "Failed to create room. Please try again." };
  }

  if (!room) {
    return { error: "Failed to create room. Please try again." };
  }

  // Create empty note for the room
  await supabase.from("notes").insert({
    room_id: room.id,
    content: "",
    updated_by: sanitizedUsername,
  });

  // Record global room creation stat & unique country (non-blocking)
  const country = headersList.get("x-vercel-ip-country");
  recordRoomCreated(country);

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
  const rateLimitResult = await rateLimit(ip, RATE_LIMITS.roomJoin);
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
        error: "Incorrect password.",
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

