import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - list all pending invitations for the current user
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Invitations where this user was invited (by email match)
  const received = await db.execute(sql`
    SELECT
      il.id,
      il.endeavor_id,
      il.code,
      il.created_at,
      e.title as endeavor_title,
      e.category as endeavor_category,
      e.image_url as endeavor_image,
      u.name as inviter_name
    FROM invite_link il
    JOIN endeavor e ON il.endeavor_id = e.id
    JOIN "user" u ON e.creator_id = u.id
    WHERE il.used_by = ${session.user.id}
    ORDER BY il.created_at DESC
    LIMIT 50
  `);

  // Invitations this user has sent (as creator of endeavors)
  const sent = await db.execute(sql`
    SELECT
      il.id,
      il.endeavor_id,
      il.code,
      il.max_uses,
      il.uses,
      il.expires_at,
      il.created_at,
      e.title as endeavor_title
    FROM invite_link il
    JOIN endeavor e ON il.endeavor_id = e.id
    WHERE e.creator_id = ${session.user.id}
    ORDER BY il.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json({ received: received.rows, sent: sent.rows });
}
