import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { usernameSchema, MAX_FILE_SIZE } from "@/lib/validations";
import { getClientIp } from "@/lib/rate-limit";
import { verifyRoomAccess } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";
import { recordFileTransferred } from "@/lib/actions/stats";
import { deleteR2Object, checkR2ObjectExists } from "@/lib/storage/r2";
import { z } from "zod";

function secureJson(data: Record<string, unknown>, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

const completeSchema = z.object({
  roomId: z.string().uuid(),
  username: usernameSchema,
  filename: z.string().min(1),
  originalName: z.string().min(1).max(255),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
  mimeType: z.string().min(1),
  storagePath: z.string().min(1),
  isEncrypted: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  let ip = "unknown";
  let requestedRoomId = "unknown";
  let requestedFilename = "unknown";

  try {
    ip = getClientIp(request);
    const body = await request.json();
    const parsed = completeSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid parameters.";
      return secureJson({ error: issue }, 400);
    }

    const {
      roomId,
      username,
      filename,
      originalName,
      size,
      mimeType,
      storagePath,
      isEncrypted,
    } = parsed.data;

    requestedRoomId = roomId;
    requestedFilename = originalName;

    // 1. Authorize room session
    if (!(await verifyRoomAccess(roomId))) {
      logSecurityEvent("file_uploaded", ip, {
        roomId,
        filename: originalName,
        status: "failed",
        reason: "unauthorized",
      });
      return secureJson({ error: "Unauthorized access to room." }, 401);
    }

    // 2. Validate that storagePath strictly begins with roomId/
    if (!storagePath.startsWith(`${roomId}/`) || storagePath.includes("..")) {
      return secureJson({ error: "Invalid storage path." }, 400);
    }

    // 3. Verify room exists and hasn't expired
    const supabase = createServerClient();
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, expires_at")
      .eq("id", roomId)
      .single();

    if (roomError || !room || new Date(room.expires_at) < new Date()) {
      // Room expired during upload — cleanup R2 object immediately
      await deleteR2Object(storagePath);
      return secureJson({ error: "Room not found or expired." }, 404);
    }

    // 4. Verify that the file was actually uploaded to R2 before creating DB record
    const existsInR2 = await checkR2ObjectExists(storagePath);
    if (!existsInR2) {
      return secureJson(
        { error: "Upload verification failed. File not found in storage." },
        400
      );
    }

    // 5. Insert file record into DB with storage_provider = 'r2'
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        room_id: roomId,
        filename,
        original_name: originalName,
        size,
        mime_type: isEncrypted ? "application/octet-stream" : mimeType,
        storage_path: storagePath,
        storage_provider: "r2",
        uploaded_by: username,
        is_encrypted: isEncrypted,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error on upload completion:", dbError);
      // Immediately delete uploaded R2 object to prevent orphaned storage
      const cleanupResult = await deleteR2Object(storagePath);
      if (!cleanupResult.success) {
        console.error(
          `[CRITICAL] Orphaned R2 object could not be deleted: ${storagePath}`,
          cleanupResult.error
        );
      }
      return secureJson({ error: "Failed to save file record." }, 500);
    }

    // 6. Record stats & audit log
    recordFileTransferred();

    logSecurityEvent("file_uploaded", ip, {
      roomId,
      fileId: fileRecord.id,
      filename: fileRecord.original_name,
      size: fileRecord.size,
      provider: "r2",
      status: "success",
    });

    return secureJson({ success: true, file: fileRecord });
  } catch (err) {
    console.error("Complete upload error:", err);
    logSecurityEvent("file_uploaded", ip, {
      roomId: requestedRoomId,
      filename: requestedFilename,
      status: "failed",
      reason: "complete_internal_error",
    });
    return secureJson({ error: "Internal server error." }, 500);
  }
}
