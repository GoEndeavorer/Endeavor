import { db } from "./db";
import { notification, member } from "./db/schema";
import { eq, and } from "drizzle-orm";

export async function notifyEndeavorMembers(
  endeavorId: string,
  type: string,
  message: string,
  excludeUserId?: string
) {
  const members = await db
    .select({ userId: member.userId })
    .from(member)
    .where(
      and(eq(member.endeavorId, endeavorId), eq(member.status, "approved"))
    );

  const toNotify = excludeUserId
    ? members.filter((m) => m.userId !== excludeUserId)
    : members;

  if (toNotify.length === 0) return;

  await db.insert(notification).values(
    toNotify.map((m) => ({
      userId: m.userId,
      type,
      message,
      endeavorId,
    }))
  );
}

export async function notifyUser(
  userId: string,
  type: string,
  message: string,
  endeavorId?: string
) {
  await db.insert(notification).values({
    userId,
    type,
    message,
    endeavorId: endeavorId || null,
  });
}
