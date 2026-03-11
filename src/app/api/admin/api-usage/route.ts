import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

type EndpointStat = {
  path: string;
  method: string;
  requests: number;
  avgResponseMs: number;
  errorRate: number;
  lastCalled: string;
};

type ApiUsageStats = {
  totalRoutes: number;
  requestsToday: number;
  avgResponseMs: number;
  errorRate: number;
  uptimePercent: number;
  topEndpoints: EndpointStat[];
  requestsByHour: { hour: string; count: number }[];
};

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mock data structure -- replace with real request_log queries when logging is enabled
  const now = new Date();

  const topEndpoints: EndpointStat[] = [
    { path: "/api/endeavors", method: "GET", requests: 4832, avgResponseMs: 42, errorRate: 0.3, lastCalled: new Date(now.getTime() - 12000).toISOString() },
    { path: "/api/endeavors/[id]", method: "GET", requests: 3901, avgResponseMs: 38, errorRate: 0.1, lastCalled: new Date(now.getTime() - 8000).toISOString() },
    { path: "/api/auth/[...all]", method: "POST", requests: 2744, avgResponseMs: 185, errorRate: 1.2, lastCalled: new Date(now.getTime() - 3000).toISOString() },
    { path: "/api/notifications", method: "GET", requests: 2156, avgResponseMs: 29, errorRate: 0.0, lastCalled: new Date(now.getTime() - 15000).toISOString() },
    { path: "/api/endeavors/trending", method: "GET", requests: 1887, avgResponseMs: 67, errorRate: 0.2, lastCalled: new Date(now.getTime() - 22000).toISOString() },
    { path: "/api/bookmarks", method: "GET", requests: 1340, avgResponseMs: 31, errorRate: 0.0, lastCalled: new Date(now.getTime() - 45000).toISOString() },
    { path: "/api/dashboard", method: "GET", requests: 1205, avgResponseMs: 112, errorRate: 0.5, lastCalled: new Date(now.getTime() - 19000).toISOString() },
    { path: "/api/feed/for-you", method: "GET", requests: 1098, avgResponseMs: 94, errorRate: 0.8, lastCalled: new Date(now.getTime() - 31000).toISOString() },
    { path: "/api/messages", method: "GET", requests: 967, avgResponseMs: 35, errorRate: 0.1, lastCalled: new Date(now.getTime() - 9000).toISOString() },
    { path: "/api/endeavors/[id]/members", method: "GET", requests: 843, avgResponseMs: 48, errorRate: 0.4, lastCalled: new Date(now.getTime() - 52000).toISOString() },
  ];

  const requestsByHour: { hour: string; count: number }[] = [];
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000);
    const label = h.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    // Simulate traffic pattern: peak during day, low at night
    const hourNum = h.getHours();
    const base = hourNum >= 9 && hourNum <= 22 ? 800 : 200;
    const jitter = Math.floor(Math.random() * 300);
    requestsByHour.push({ hour: label, count: base + jitter });
  }

  const stats: ApiUsageStats = {
    totalRoutes: 92,
    requestsToday: requestsByHour.reduce((sum, h) => sum + h.count, 0),
    avgResponseMs: 58,
    errorRate: 0.4,
    uptimePercent: 99.97,
    topEndpoints,
    requestsByHour,
  };

  return NextResponse.json(stats);
}
