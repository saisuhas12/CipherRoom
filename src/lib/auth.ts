import { cookies } from "next/headers";
import crypto from "crypto";
import { createServerClient } from "@/lib/supabase/server";

const SECRET = process.env.SESSION_SECRET;

if (!SECRET) {
  throw new Error("SESSION_SECRET environment variable is missing!");
}

export function generateRoomToken(roomId: string, slug: string): string {
  const signature = crypto.createHmac("sha256", SECRET!)
    .update(`${roomId}:${slug}`)
    .digest("hex");
  return `${roomId}:${slug}:${signature}`;
}

export function verifyRoomToken(token: string, roomId: string, slug: string): boolean {
  try {
    const signature = crypto.createHmac("sha256", SECRET!)
      .update(`${roomId}:${slug}`)
      .digest("hex");
    const expectedToken = `${roomId}:${slug}:${signature}`;
    return token === expectedToken;
  } catch {
    return false;
  }
}

export async function setRoomSession(roomId: string, slug: string, expiresAt: string) {
  const token = generateRoomToken(roomId, slug);
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
