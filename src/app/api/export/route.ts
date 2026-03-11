import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  user,
  endeavor,
  member,
  discussion,
  task,
  story,
  directMessage,
  bookmark,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/export — download all user data as JSON
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    profileRows,
    endeavorsCreated,
    memberships,
    discussions,
    assignedTasks,
    stories,
    dms,
    bookmarks,
  ] = await Promise.all([
    db.select().from(user).where(eq(user.id, userId)),
    db.select().from(endeavor).where(eq(endeavor.creatorId, userId)),
    db.select().from(member).where(eq(member.userId, userId)),
    db.select().from(discussion).where(eq(discussion.authorId, userId)),
    db.select().from(task).where(eq(task.assigneeId, userId)),
    db.select().from(story).where(eq(story.authorId, userId)),
    db
      .select()
      .from(directMessage)
      .where(
        or(
          eq(directMessage.senderId, userId),
          eq(directMessage.recipientId, userId)
        )
      ),
    db.select().from(bookmark).where(eq(bookmark.userId, userId)),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: profileRows[0] ?? null,
    endeavors: endeavorsCreated,
    memberships,
    discussions,
    tasks: assignedTasks,
    stories,
    directMessages: dms,
    bookmarks,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="endeavor-data-export.json"`,
    },
  });
}
