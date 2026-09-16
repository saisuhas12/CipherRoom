import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isAllowedMimeType, MAX_FILE_SIZE, usernameSchema } from "@/lib/validations";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { verifyRoomAccess } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";
import { createR2PresignedUploadUrl } from "@/lib/storage/r2";
import { z } from "zod";

function secureJson(data: Record<string, unknown>, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

const presignSchema = z.object({
  roomId: z.string().uuid(),
  username: usernameSchema,
  filename: z.string().min(1).max(255),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
  originalMimeType: z.string().min(1),
  isEncrypted: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  let ip = "unknown";
  let requestedRoomId = "unknown";
  let requestedFilename = "unknown";

  try {
    ip = getClientIp(request);

    // 1. Rate Limit
    const rateLimitResult = await rateLimit(ip, RATE_LIMITS.fileUpload);
    if (!rateLimitResult.success) {
      return secureJson(
        { error: "Too many upload requests. Please try again later." },
        429
      );
    }

    const body = await request.json();
    const parsed = presignSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid upload parameters.";
      return secureJson({ error: issue }, 400);
    }

    const { roomId, filename, originalMimeType, isEncrypted } =
      parsed.data;
    requestedRoomId = roomId;
    requestedFilename = filename;

    // 2. Validate MIME type
    if (!isAllowedMimeType(originalMimeType)) {
      return secureJson({ error: "File type not allowed." }, 400);
    }

    // 3. Authorize room session
    if (!(await verifyRoomAccess(roomId))) {
      logSecurityEvent("file_uploaded", ip, {
        roomId,
        filename,
        status: "failed",
        reason: "unauthorized",
      });
      return secureJson({ error: "Unauthorized access to room." }, 401);
    }

    // 4. Verify room exists and has not expired
    const supabase = createServerClient();
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, expires_at")
      .eq("id", roomId)
      .single();

    if (roomError || !room || new Date(room.expires_at) < new Date()) {
      return secureJson({ error: "Room not found or expired." }, 404);
    }

    // 5. Generate secure, unique object key
    const fileId = crypto.randomUUID();
    const rawExtension = filename.split(".").pop() || "bin";
    const safeExtension = rawExtension.replace(/[^a-zA-Z0-9]/g, "");
    const finalFilename = `${fileId}.${isEncrypted ? "enc" : safeExtension}`;
    const storagePath = `${roomId}/${finalFilename}`;

    // 6. Pin Content-Type so client cannot upload unvalidated content
    const contentType = isEncrypted
      ? "application/octet-stream"
      : originalMimeType || "application/octet-stream";

    // 7. Generate presigned upload URL (5-minute expiry)
    const uploadUrl = await createR2PresignedUploadUrl(storagePath, contentType, 300);

    return secureJson({
      success: true,
      uploadUrl,
      fileId,
      filename: finalFilename,
      storagePath,
      contentType,
    });
  } catch (err) {
    console.error("Presign upload error:", err);
    logSecurityEvent("file_uploaded", ip, {
      roomId: requestedRoomId,
      filename: requestedFilename,
      status: "failed",
      reason: "presign_internal_error",
    });
    return secureJson({ error: "Failed to generate upload URL." }, 500);
  }
}
