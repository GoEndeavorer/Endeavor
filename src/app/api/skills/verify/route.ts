import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Ensure table exists
async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS skill_verification (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      requester_id TEXT NOT NULL,
      verifier_id TEXT NOT NULL,
      skill TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      verified_at TIMESTAMPTZ
    )
  `);
}

// POST: Request skill verification from another user
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { verifierId, skill, note } = body;

  if (!verifierId || !skill) {
    return NextResponse.json(
      { error: "verifierId and skill are required" },
      { status: 400 }
    );
  }

  if (verifierId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot request verification from yourself" },
      { status: 400 }
    );
  }

  await ensureTable();

  // Check for duplicate pending request
  const existing = await db.execute(sql`
    SELECT id FROM skill_verification
    WHERE requester_id = ${session.user.id}
      AND verifier_id = ${verifierId}
      AND skill = ${skill}
      AND status = 'pending'
    LIMIT 1
  `);

  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "A pending verification request already exists for this skill" },
      { status: 409 }
    );
  }

  const result = await db.execute(sql`
    INSERT INTO skill_verification (requester_id, verifier_id, skill, note)
    VALUES (${session.user.id}, ${verifierId}, ${skill}, ${note || null})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}

// GET: List pending/completed verifications for current user
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTable();

  const role = request.nextUrl.searchParams.get("role") || "all";
  const status = request.nextUrl.searchParams.get("status");

  let result;

  if (role === "verifier") {
    // Requests where I am the verifier
    result = await db.execute(sql`
      SELECT sv.*, u.name as requester_name, u.image as requester_image
      FROM skill_verification sv
      LEFT JOIN "user" u ON u.id = sv.requester_id
      WHERE sv.verifier_id = ${session.user.id}
      ${status ? sql`AND sv.status = ${status}` : sql``}
      ORDER BY sv.created_at DESC
    `);
  } else if (role === "requester") {
    // Requests I have made
    result = await db.execute(sql`
      SELECT sv.*, u.name as verifier_name, u.image as verifier_image
      FROM skill_verification sv
      LEFT JOIN "user" u ON u.id = sv.verifier_id
      WHERE sv.requester_id = ${session.user.id}
      ${status ? sql`AND sv.status = ${status}` : sql``}
      ORDER BY sv.created_at DESC
    `);
  } else {
    // All verifications involving the user
    result = await db.execute(sql`
      SELECT sv.*,
        req.name as requester_name, req.image as requester_image,
        ver.name as verifier_name, ver.image as verifier_image
      FROM skill_verification sv
      LEFT JOIN "user" req ON req.id = sv.requester_id
      LEFT JOIN "user" ver ON ver.id = sv.verifier_id
      WHERE sv.requester_id = ${session.user.id}
         OR sv.verifier_id = ${session.user.id}
      ${status ? sql`AND sv.status = ${status}` : sql``}
      ORDER BY sv.created_at DESC
    `);
  }

  return NextResponse.json(result.rows);
}

// PATCH: Approve/reject a verification request
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status: newStatus, note } = body;

  if (!id || !newStatus) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 400 }
    );
  }

  if (!["approved", "rejected"].includes(newStatus)) {
    return NextResponse.json(
      { error: "status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }

  await ensureTable();

  // Only the verifier can approve/reject
  const verification = await db.execute(sql`
    SELECT * FROM skill_verification
    WHERE id = ${id}::uuid AND verifier_id = ${session.user.id} AND status = 'pending'
    LIMIT 1
  `);

  if (verification.rows.length === 0) {
    return NextResponse.json(
      { error: "Verification request not found or not authorized" },
      { status: 404 }
    );
  }

  const result = await db.execute(sql`
    UPDATE skill_verification
    SET status = ${newStatus},
        note = COALESCE(${note || null}, note),
        verified_at = ${newStatus === "approved" ? sql`NOW()` : sql`NULL`}
    WHERE id = ${id}::uuid
    RETURNING *
  `);

  return NextResponse.json(result.rows[0]);
}
