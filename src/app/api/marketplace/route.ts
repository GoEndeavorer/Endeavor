import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS marketplace_listing (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'service',
      type TEXT NOT NULL DEFAULT 'offer',
      price_type TEXT NOT NULL DEFAULT 'negotiable',
      price DECIMAL(12,2),
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'active',
      tags TEXT[] DEFAULT '{}',
      view_count INT NOT NULL DEFAULT 0,
      inquiry_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let whereClause = "WHERE ml.status = 'active'";
  if (category) whereClause += ` AND ml.category = '${category.replace(/'/g, "''")}'`;
  if (type) whereClause += ` AND ml.type = '${type.replace(/'/g, "''")}'`;

  const result = await db.execute(
    sql.raw(`
      SELECT ml.*, u.name as seller_name, u.image as seller_image
      FROM marketplace_listing ml
      JOIN "user" u ON ml.seller_id = u.id
      ${whereClause}
      ORDER BY ml.created_at DESC LIMIT 50
    `)
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, category, type, priceType, price, tags } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS marketplace_listing (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'service',
      type TEXT NOT NULL DEFAULT 'offer',
      price_type TEXT NOT NULL DEFAULT 'negotiable',
      price DECIMAL(12,2),
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'active',
      tags TEXT[] DEFAULT '{}',
      view_count INT NOT NULL DEFAULT 0,
      inquiry_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const result = await db.execute(sql`
    INSERT INTO marketplace_listing (seller_id, title, description, category, type, price_type, price, tags)
    VALUES (${session.user.id}, ${title.trim()}, ${description || null}, ${category || "service"}, ${type || "offer"}, ${priceType || "negotiable"}, ${price || null}, ${tags || []})
    RETURNING *
  `);

  return NextResponse.json(result.rows[0], { status: 201 });
}
