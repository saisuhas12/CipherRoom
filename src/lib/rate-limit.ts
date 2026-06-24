type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export type RateLimitConfig = {
  /** Unique identifier for this limit (e.g., "room-create") */
  prefix: string;
  /** Maximum number of requests allowed */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
};

export const RATE_LIMITS = {
  roomCreate: { prefix: "room-create", limit: 5, windowSeconds: 3600 } as RateLimitConfig,
  roomJoin: { prefix: "room-join", limit: 10, windowSeconds: 60 } as RateLimitConfig,
  fileUpload: { prefix: "file-upload", limit: 20, windowSeconds: 3600 } as RateLimitConfig,
  messageSend: { prefix: "msg-send", limit: 60, windowSeconds: 60 } as RateLimitConfig,
} as const;

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const key = `${config.prefix}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}
