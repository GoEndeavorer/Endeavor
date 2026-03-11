// Simple in-memory rate limiter for API routes
// For production, consider using Redis-based rate limiting

const store = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store) {
    if (value.resetAt < now) store.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function rateLimitByIp(
  ip: string,
  endpoint: string,
  limit: number = 60,
  windowMs: number = 60_000
) {
  return rateLimit(`${ip}:${endpoint}`, limit, windowMs);
}
