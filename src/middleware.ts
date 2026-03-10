import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (per-IP, per-minute)
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number = 60): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimit.entries()) {
    if (entry.resetAt < now) rateLimit.delete(key);
  }
}, 60_000);

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // Rate limit API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Stricter limit for auth routes
    const limit = request.nextUrl.pathname.startsWith("/api/auth") ? 20 : 60;

    if (!checkRateLimit(`${ip}:${request.nextUrl.pathname}`, limit)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
