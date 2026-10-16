import { cookies } from "next/headers";
import crypto from "crypto";
import { createServerClient } from "@/lib/supabase/server";

const SECRET = process.env.SESSION_SECRET;

if (!SECRET) {
  throw new Error("SESSION_SECRET environment variable is missing!");
}

export type RoomRole = "creator" | "member";

export function generateRoomToken(
  roomId: string,
  slug: string,
  role: RoomRole = "member"
): string {
  const signature = crypto
    .createHmac("sha256", SECRET!)
    .update(`${roomId}:${slug}:${role}`)
    .digest("hex");
  return `${roomId}:${slug}:${role}:${signature}`;
}

export function verifyRoomToken(
  token: string,
  roomId: string,
  slug: string,
  requiredRole?: RoomRole
): boolean {
  try {
    const parts = token.split(":");
    // Modern 4-part token: roomId:slug:role:signature
    if (parts.length === 4) {
      const [tRoomId, tSlug, tRole, tSig] = parts;
      if (tRoomId !== roomId || tSlug !== slug) return false;
      if (requiredRole && tRole !== requiredRole) return false;

      const expectedSig = crypto
        .createHmac("sha256", SECRET!)
        .update(`${tRoomId}:${tSlug}:${tRole}`)
        .digest("hex");
      return tSig === expectedSig;
    }
    // Backward-compatible 3-part token: roomId:slug:signature (always member role)
    if (parts.length === 3) {
      if (requiredRole === "creator") return false;
      const [tRoomId, tSlug, tSig] = parts;
      if (tRoomId !== roomId || tSlug !== slug) return false;
      const expectedSig = crypto
        .createHmac("sha256", SECRET!)
        .update(`${tRoomId}:${tSlug}`)
        .digest("hex");
      return tSig === expectedSig;
    }
    return false;
  } catch {
    return false;
  }
}

export async function setRoomSession(
  roomId: string,
  slug: string,
  expiresAt: string,
  role: RoomRole = "member"
) {
  const token = generateRoomToken(roomId, slug, role);
  const cookieStore = await cookies();
  const expires = new Date(expiresAt);

  cookieStore.set(`room_session_${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires,
    path: "/",
  });
}

export async function verifyRoomAdmin(roomId: string, slug: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(`room_session_${slug}`)?.value;
    if (!token) return false;
    return verifyRoomToken(token, roomId, slug, "creator");
  } catch {
    return false;
  }
}

export async function getRoomSessionRole(slug: string, roomId: string): Promise<RoomRole | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(`room_session_${slug}`)?.value;
    if (!token) return null;
    if (verifyRoomToken(token, roomId, slug, "creator")) return "creator";
    if (verifyRoomToken(token, roomId, slug, "member")) return "member";
    return null;
  } catch {
    return null;
  }
}

export async function verifyRoomAccess(roomId: string): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { data: room } = await supabase
      .from("rooms")
      .select("slug, expires_at")
      .eq("id", roomId)
      .single();

    if (!room) return false;

    // Check if room has expired
    if (new Date(room.expires_at) < new Date()) {
      return false;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(`room_session_${room.slug}`)?.value;
    if (!token) return false;

    return verifyRoomToken(token, roomId, room.slug);
  } catch {
    return false;
  }
}
