import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Endorsements are stored as a JSON array in a column we'll manage through the API
// Since we don't have a dedicated endorsement table, we use a lightweight approach
// with the user's skills array and a simple key-value store pattern

// For now, use an in-memory approach that checks endeavor membership
// to validate endorsements (you can only endorse someone you've collaborated with)

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Get the user's skills and count endorsements from shared endeavors
  const [targetUser] = await db
    .select({ skills: user.skills })
    .from(user)
    .where(eq(user.id, userId));

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Count how many collaborators the user has (people who've been in the same endeavor)
  const collaboratorCount = await db.execute(sql`
    SELECT COUNT(DISTINCT m2.user_id) as count
    FROM member m1
    JOIN member m2 ON m1.endeavor_id = m2.endeavor_id AND m1.user_id != m2.user_id
    WHERE m1.user_id = ${userId}
    AND m1.status = 'approved'
    AND m2.status = 'approved'
  `);

  const collaborators = Number(collaboratorCount.rows[0]?.count || 0);

  return NextResponse.json({
    skills: targetUser.skills || [],
    collaborators,
  });
}
