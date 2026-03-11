import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  user,
  session,
  account,
  member,
  discussion,
  task,
  story,
  notification,
  bookmark,
  follow,
  report,
  endeavor,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";

export async function DELETE() {
  const sess = await auth.api.getSession({ headers: await headers() });
  if (!sess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = sess.user.id;

  // Check if user is the sole creator of any active endeavors
  const ownedActive = await db
    .select({ id: endeavor.id, title: endeavor.title })
    .from(endeavor)
    .where(
      sql`${endeavor.creatorId} = ${userId} AND ${endeavor.status} IN ('open', 'in-progress')`
    );

  if (ownedActive.length > 0) {
    return NextResponse.json(
      {
        error: "You must complete or cancel your active endeavors before deleting your account.",
        endeavors: ownedActive.map((e) => e.title),
      },
      { status: 400 }
    );
  }

  // Delete in dependency order
  await db.delete(notification).where(eq(notification.userId, userId));
  await db.delete(bookmark).where(eq(bookmark.userId, userId));
  await db.delete(follow).where(
    sql`${follow.followerId} = ${userId} OR ${follow.followingId} = ${userId}`
  );
  await db.delete(report).where(eq(report.reporterId, userId));
  await db.delete(discussion).where(eq(discussion.authorId, userId));
  await db.delete(story).where(eq(story.authorId, userId));
  await db.update(task).set({ assigneeId: null }).where(eq(task.assigneeId, userId));
  await db.delete(member).where(eq(member.userId, userId));
  await db.delete(session).where(eq(session.userId, userId));
  await db.delete(account).where(eq(account.userId, userId));
  await db.delete(user).where(eq(user.id, userId));

  return NextResponse.json({ success: true });
}
