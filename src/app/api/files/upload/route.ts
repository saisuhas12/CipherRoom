import { NextResponse } from "next/server";

/**
 * Legacy upload endpoint is permanently deprecated and disabled.
 * File uploads now use presigned direct R2 uploads via /api/files/upload/presign and /api/files/upload/complete.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This upload endpoint is deprecated. Use presigned direct upload.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
