import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { link, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { isMemberOf } from "@/lib/membership";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await db
    .select({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      createdAt: link.createdAt,
      addedByName: user.name,
    })
    .from(link)
    .innerJoin(user, eq(link.addedById, user.id))
    .where(eq(link.endeavorId, id))
    .orderBy(desc(link.createdAt));

  return NextResponse.json(links);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !(await isMemberOf(id, session.user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, url, description } = await request.json();
  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json(
      { error: "Title and URL are required" },
      { status: 400 }
    );
  }

  const [newLink] = await db
    .insert(link)
    .values({
      endeavorId: id,
      addedById: session.user.id,
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() || null,
    })
    .returning();

  return NextResponse.json(
    { ...newLink, addedByName: session.user.name },
    { status: 201 }
  );
}
