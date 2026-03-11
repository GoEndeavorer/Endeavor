import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// GET - get user's referral stats and code
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS referral (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_id TEXT NOT NULL,
      referred_id TEXT,
      code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `);

  // Get or create referral code
  let codeResult = await db.execute(sql`
    SELECT DISTINCT code FROM referral WHERE referrer_id = ${session.user.id} LIMIT 1
  `);

  let code: string;
  if (codeResult.rows.length === 0) {
    code = session.user.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) +
      Math.random().toString(36).slice(2, 6);
    await db.execute(sql`
      INSERT INTO referral (referrer_id, code) VALUES (${session.user.id}, ${code})
    `);
  } else {
    code = (codeResult.rows[0] as { code: string }).code;
  }

  // Get referral stats
  const stats = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) as total
    FROM referral
    WHERE referrer_id = ${session.user.id} AND referred_id IS NOT NULL
  `);

  // Get referred users
  const referred = await db.execute(sql`
    SELECT
      r.status,
      r.completed_at,
      u.name,
      u.image
    FROM referral r
    JOIN "user" u ON r.referred_id = u.id
    WHERE r.referrer_id = ${session.user.id} AND r.referred_id IS NOT NULL
    ORDER BY r.created_at DESC
    LIMIT 20
  `);

  return NextResponse.json({
    code,
    stats: stats.rows[0] || { completed: 0, pending: 0, total: 0 },
    referredUsers: referred.rows,
  });
}

// POST - redeem a referral code (called during signup flow)
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await request.json();

  if (!code?.trim()) {
    return NextResponse.json({ error: "Referral code required" }, { status: 400 });
  }

  // Find the referral code
  const referral = await db.execute(sql`
    SELECT id, referrer_id FROM referral WHERE code = ${code.trim()} AND referred_id IS NULL
    LIMIT 1
  `);

  if (referral.rows.length === 0) {
    return NextResponse.json({ error: "Invalid or already used referral code" }, { status: 400 });
  }

  const ref = referral.rows[0] as { id: string; referrer_id: string };

  if (ref.referrer_id === session.user.id) {
    return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });
  }

  // Create a new referral entry for this specific referral
  await db.execute(sql`
    INSERT INTO referral (referrer_id, referred_id, code, status, completed_at)
    VALUES (${ref.referrer_id}, ${session.user.id}, ${code.trim() + "-" + Date.now()}, 'completed', NOW())
  `);

  return NextResponse.json({ success: true, message: "Referral redeemed!" });
}
