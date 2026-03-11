import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const startTime = Date.now();

export async function GET() {
  const now = new Date().toISOString();
  let databaseStatus: "connected" | "disconnected" = "disconnected";
  let totalEndeavors = 0;
  let totalUsers = 0;

  try {
    const result = await db.execute(sql`SELECT 1 AS ok`);
    if (result.rows.length > 0) {
      databaseStatus = "connected";
    }

    const endeavorCount = await db.execute(
      sql`SELECT COUNT(*)::int AS count FROM "endeavor"`
    );
    totalEndeavors = (endeavorCount.rows[0] as { count: number })?.count ?? 0;

    const userCount = await db.execute(
      sql`SELECT COUNT(*)::int AS count FROM "user"`
    );
    totalUsers = (userCount.rows[0] as { count: number })?.count ?? 0;
  } catch {
    databaseStatus = "disconnected";
  }

  const uptimeMs = Date.now() - startTime;

  return NextResponse.json({
    status: databaseStatus === "connected" ? "ok" : "degraded",
    database: databaseStatus,
    apiVersion: "1.0.0",
    uptime: uptimeMs,
    lastChecked: now,
    stats: {
      totalEndeavors,
      totalUsers,
    },
  });
}
