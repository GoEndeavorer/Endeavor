import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const ensureTables = async () => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS poll (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'single',
      status TEXT NOT NULL DEFAULT 'active',
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS poll_option (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      poll_id UUID NOT NULL REFERENCES poll(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      vote_count INT NOT NULL DEFAULT 0,
      display_order INT NOT NULL DEFAULT 0
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS poll_vote (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      poll_id UUID NOT NULL REFERENCES poll(id) ON DELETE CASCADE,
      option_id UUID NOT NULL REFERENCES poll_option(id) ON DELETE CASCADE,
      voter_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(poll_id, voter_id, option_id)
    )
  `);
};

// GET — list active polls
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureTables();

  const result = await db.execute(sql`
    SELECT
      p.*,
      u.name as creator_name,
      u.image as creator_image,
      (SELECT COUNT(*) FROM poll_vote pv WHERE pv.poll_id = p.id) as total_votes
    FROM poll p
    JOIN "user" u ON p.creator_id = u.id
    WHERE p.status = 'active'
      AND (p.expires_at IS NULL OR p.expires_at > NOW())
    ORDER BY p.created_at DESC
  `);

  const polls = result.rows as Record<string, unknown>[];

  // Enrich with options and user votes
  const enriched = await Promise.all(
    polls.map(async (p) => {
      const optionsResult = await db.execute(sql`
        SELECT id, label, vote_count, display_order
        FROM poll_option
        WHERE poll_id = ${p.id as string}
        ORDER BY display_order ASC
      `);

      const userVotesResult = await db.execute(sql`
        SELECT option_id FROM poll_vote
        WHERE poll_id = ${p.id as string} AND voter_id = ${session.user.id}
      `);

      return {
        ...p,
        options: optionsResult.rows,
        userVotes: (userVotesResult.rows as { option_id: string }[]).map(
          (v) => v.option_id
        ),
      };
    })
  );

  return NextResponse.json(enriched);
}

// POST — create a poll
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, type, options, expiresAt } =
    await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
    return NextResponse.json(
      { error: "2-10 options required" },
      { status: 400 }
    );
  }

  const pollType = type === "multiple" ? "multiple" : "single";

  await ensureTables();

  const pollResult = await db.execute(sql`
    INSERT INTO poll (creator_id, title, description, type, expires_at)
    VALUES (
      ${session.user.id},
      ${title.trim()},
      ${description?.trim() || null},
      ${pollType},
      ${expiresAt ? new Date(expiresAt) : null}
    )
    RETURNING *
  `);

  const created = pollResult.rows[0] as { id: string };

  // Insert options
  for (let i = 0; i < options.length; i++) {
    const label = (options[i] as string).trim();
    if (label) {
      await db.execute(sql`
        INSERT INTO poll_option (poll_id, label, display_order)
        VALUES (${created.id}, ${label}, ${i})
      `);
    }
  }

  // Return with options
  const optionsResult = await db.execute(sql`
    SELECT id, label, vote_count, display_order
    FROM poll_option WHERE poll_id = ${created.id}
    ORDER BY display_order ASC
  `);

  return NextResponse.json(
    { ...created, options: optionsResult.rows, userVotes: [] },
    { status: 201 }
  );
}
