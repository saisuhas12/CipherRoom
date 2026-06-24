import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isAllowedMimeType, MAX_FILE_SIZE } from "@/lib/validations";
import { rateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(ip, RATE_LIMITS.fileUpload);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const roomId = formData.get("roomId") as string | null;
    const username = formData.get("username") as string | null;
    const isEncrypted = formData.get("isEncrypted") === "true";

    if (!file || !roomId || !username) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 100MB limit." },
        { status: 400 }
      );
    }

    // Validate file type (only for non-encrypted files since encrypted files have different mime)
    if (!isEncrypted && !isAllowedMimeType(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify room exists and hasn't expired
    const { data: room } = await supabase
      .from("rooms")
      .select("id, expires_at")
      .eq("id", roomId)
      .single();

    if (!room || new Date(room.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Room not found or expired." },
        { status: 404 }
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
      return NextResponse.json(
        { error: "Failed to upload file." },
        { status: 500 }
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
      return NextResponse.json(
        { error: "Failed to save file record." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, file: fileRecord });
  } catch (err) {
    console.error("File upload error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
