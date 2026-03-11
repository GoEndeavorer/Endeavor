import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: Return most popular skills across the platform
export async function GET() {
  const result = await db.execute(
    sql`SELECT s AS skill, COUNT(*)::int AS count
        FROM ${user}, unnest(${user.skills}) AS s
        WHERE ${user.skills} IS NOT NULL
        GROUP BY s
        ORDER BY count DESC
        LIMIT 20`
  );

  return NextResponse.json(result.rows as { skill: string; count: number }[]);
}
