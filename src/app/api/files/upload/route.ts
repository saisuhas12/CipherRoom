import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isAllowedMimeType, MAX_FILE_SIZE, usernameSchema } from "@/lib/validations";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { verifyRoomAccess } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";
import { recordFileTransferred } from "@/lib/actions/stats";
import { z } from "zod";

/**
 * Creates a JSON response with security headers.
 */
function secureJson(data: Record<string, unknown>, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

export async function POST(request: NextRequest) {
  let ip = "unknown";
  let requestedRoomId = "unknown";
  let requestedFilename = "unknown";

  try {
    // Rate limit
    ip = getClientIp(request);
    const rateLimitResult = await rateLimit(ip, RATE_LIMITS.fileUpload);
    if (!rateLimitResult.success) {
      return secureJson(
        { error: "Too many uploads. Please try again later." },
        429
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const roomId = formData.get("roomId") as string | null;
    const username = formData.get("username") as string | null;
    const isEncrypted = formData.get("isEncrypted") === "true";
    const originalMimeType = (formData.get("originalMimeType") as string | null) || file?.type || "";

    if (!file || !roomId || !username) {
      return secureJson(
        { error: "Missing required fields." },
        400
      );
    }

    requestedRoomId = roomId;
    requestedFilename = file.name;

    // Validate parameters
    const parsedRoomId = z.string().uuid().safeParse(roomId);
    const parsedUsername = usernameSchema.safeParse(username);
    if (!parsedRoomId.success || !parsedUsername.success) {
      return secureJson(
        { error: "Invalid parameters." },
        400
      );
    }

    // Authorize room access
    if (!(await verifyRoomAccess(roomId))) {
      logSecurityEvent("file_uploaded", ip, {
        roomId,
        filename: file.name,
        status: "failed",
        reason: "unauthorized",
      });
      return secureJson(
        { error: "Unauthorized access to room." },
        401
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return secureJson(
        { error: "File exceeds 100MB limit." },
        400
      );
    }

    // Validate file type (always validate original MIME type, even if file content is encrypted)
    if (!isAllowedMimeType(originalMimeType)) {
      return secureJson(
        { error: "File type not allowed." },
        400
      );
    }

    const supabase = createServerClient();

    // Verify room exists and hasn't expired (safety database check)
    const { data: room } = await supabase
      .from("rooms")
      .select("id, expires_at")
      .eq("id", roomId)
      .single();

    if (!room || new Date(room.expires_at) < new Date()) {
      return secureJson(
        { error: "Room not found or expired." },
        404
      );
    }

    // Generate unique filename
    const fileId = crypto.randomUUID();
    const extension = file.name.split(".").pop() || "bin";
    const storagePath = `${roomId}/${fileId}.${isEncrypted ? "enc" : extension}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("room-files")
      .upload(storagePath, arrayBuffer, {
        contentType: isEncrypted ? "application/octet-stream" : file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return secureJson(
        { error: "Failed to upload file." },
        500
      );
    }

    // Insert file record
    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        room_id: roomId,
        filename: `${fileId}.${isEncrypted ? "enc" : extension}`,
        original_name: file.name,
        size: file.size,
        mime_type: isEncrypted ? "application/octet-stream" : file.type,
        storage_path: storagePath,
        uploaded_by: username,
        is_encrypted: isEncrypted,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      // Cleanup uploaded file
      await supabase.storage.from("room-files").remove([storagePath]);
      return secureJson(
        { error: "Failed to save file record." },
        500
      );
    }

    // Record global file transfer stat (non-blocking)
    recordFileTransferred();

    logSecurityEvent("file_uploaded", ip, {
      roomId,
      fileId: fileRecord.id,
      filename: fileRecord.original_name,
      size: fileRecord.size,
      status: "success",
    });

    return secureJson({ success: true, file: fileRecord });
  } catch (err) {
    console.error("File upload error:", err);
    logSecurityEvent("file_uploaded", ip, {
      roomId: requestedRoomId,
      filename: requestedFilename,
      status: "failed",
      reason: "internal_error",
    });
    return secureJson(
      { error: "Internal server error." },
      500
    );
  }
}
