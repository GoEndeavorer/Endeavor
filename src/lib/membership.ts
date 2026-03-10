import { db } from "./db";
import { member } from "./db/schema";
import { and, eq } from "drizzle-orm";

export async function isMemberOf(endeavorId: string, userId: string) {
  const [result] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, endeavorId),
        eq(member.userId, userId),
        eq(member.status, "approved")
      )
    )
    .limit(1);
  return !!result;
}
