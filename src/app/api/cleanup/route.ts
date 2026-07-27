import { NextRequest, NextResponse } from "next/server";
import { cleanupAllExpiredRooms } from "@/lib/actions/room";

/**
 * Creates a JSON response with security headers.
 */
function secureJson(data: Record<string, unknown>, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

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
  const urlSecret = request.nextUrl.searchParams.get("secret");
  const secret = process.env.CLEANUP_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  // Require secret in production; bypass authorization in local development
  if (secret && !isDev) {
    const isAuthorizedHeader = authHeader === `Bearer ${secret}`;
    const isAuthorizedQuery = urlSecret === secret;

    if (!isAuthorizedHeader && !isAuthorizedQuery) {
      return secureJson({ error: "Unauthorized" }, 401);
    }
  }

  try {
    const result = await cleanupAllExpiredRooms();

    if (result.error) {
      return secureJson({ error: result.error }, 500);
    }

    return secureJson({
      success: true,
      cleaned: result.cleaned,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cleanup cron error:", err);
    return secureJson({ error: "Internal server error." }, 500);
  }
}

