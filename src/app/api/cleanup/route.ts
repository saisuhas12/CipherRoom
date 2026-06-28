import { NextRequest, NextResponse } from "next/server";
import { cleanupAllExpiredRooms } from "@/lib/actions/room";

/**
 * GET /api/cleanup
 *
 * Cron endpoint to clean up all expired rooms and their associated
 * storage files. Protected by CLEANUP_SECRET env var.
 *
 * Can be called by:
 * - Vercel Cron Jobs (configured in vercel.json)
 * - External cron services (cron-job.org, etc.)
 * - Manual trigger for testing
 */
export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CLEANUP_SECRET;

  // If CLEANUP_SECRET is set, require it. Otherwise allow (for dev).
  if (secret) {
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await cleanupAllExpiredRooms();

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cleaned: result.cleaned,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cleanup cron error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
