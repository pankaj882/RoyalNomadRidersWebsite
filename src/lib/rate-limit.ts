import "server-only";

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Unique key for the limited action + identity, e.g. `contact:203.0.113.4`. */
  key: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window duration in seconds. */
  windowSeconds: number;
}

// -----------------------------------------------------------------------------
// In-memory fallback store. Resets on server restart and is NOT shared across
// serverless instances — acceptable for low-to-moderate traffic on Vercel's
// free tier, but should be swapped for Upstash Redis (already wired below)
// before scaling to multiple concurrent instances.
// -----------------------------------------------------------------------------
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function checkMemoryRateLimit({ key, limit, windowSeconds }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowSeconds * 1000;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

async function checkUpstashRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { serverEnv } = await import("@/lib/env.server");
  const url = serverEnv.UPSTASH_REDIS_REST_URL;
  const token = serverEnv.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return checkMemoryRateLimit(options);
  }

  const { key, limit, windowSeconds } = options;

  try {
    // Upstash REST pipeline: INCR the counter, then set an expiry only the
    // first time (NX) so the window resets cleanly every `windowSeconds`.
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSeconds), "NX"],
      ]),
    });

    if (!response.ok) {
      // Fail open to the in-memory limiter rather than blocking all traffic
      // if Upstash is briefly unreachable.
      return checkMemoryRateLimit(options);
    }

    const [incrResult] = (await response.json()) as [{ result: number }, { result: number }];
    const count = incrResult.result;

    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: Date.now() + windowSeconds * 1000,
    };
  } catch (error) {
    console.error("Upstash rate limit check failed, falling back to in-memory:", error);
    return checkMemoryRateLimit(options);
  }
}

/**
 * Checks and increments a rate limit counter for the given key. Use a key
 * that combines the action name and requester identity, e.g.
 * `checkRateLimit({ key: \`contact:\${ip}\`, limit: 5, windowSeconds: 3600 })`.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  return checkUpstashRateLimit(options);
}
