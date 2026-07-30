type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Cleanup stale in-memory entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

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
  noteUpdate: { prefix: "note-update", limit: 30, windowSeconds: 60 } as RateLimitConfig,
} as const;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Distributed rate limiter with in-memory fallback.
 * Uses Upstash Redis / Vercel KV REST API if credentials exist;
 * otherwise uses in-memory sliding window Map.
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const key = `ratelimit:${config.prefix}:${identifier}`;
      // Use Upstash Redis REST Pipeline API for atomic multi-command execution
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, config.windowSeconds, "NX"],
          ["PTTL", key],
        ]),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        // data structure: [{ result: count }, { result: 1|0 }, { result: ttlMs }]
        const currentCount = Number(data[0]?.result ?? 1);
        const ttlMs = Number(data[2]?.result ?? config.windowSeconds * 1000);
        const resetAt = Date.now() + (ttlMs > 0 ? ttlMs : config.windowSeconds * 1000);
        const remaining = Math.max(0, config.limit - currentCount);

        return {
          success: currentCount <= config.limit,
          remaining,
          resetAt,
        };
      }
    } catch {
      // Fallback to in-memory store if Redis REST request fails
    }
  }

  // Fallback: In-memory store
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

export function getClientIp(source: Request | Headers): string {
  const headers = source instanceof Request ? source.headers : source;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || "unknown";
}

/**
 * Returns whether distributed Redis or in-memory store is currently active.
 */
export function getRateLimitStoreType(): "redis" | "memory" {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return redisUrl && redisToken ? "redis" : "memory";
}
