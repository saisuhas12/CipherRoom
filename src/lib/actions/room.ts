"use server";

import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase/server";
import { createRoomSchema, joinRoomSchema } from "@/lib/validations";
import { generateSlug, getAppUrl } from "@/lib/utils";

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
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;

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

  // Check if room has expired
  if (new Date(room.expires_at) < new Date()) {
    return { error: "This room has expired." };
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

  return room;
}
