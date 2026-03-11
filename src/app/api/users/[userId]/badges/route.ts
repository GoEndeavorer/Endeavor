import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// User badge system - computed from activity
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Calculate badges based on user activity
  const [endeavorCount, storyCount, discussionCount, membershipCount] = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int as count FROM endeavor WHERE "creatorId" = ${userId}`),
    db.execute(sql`SELECT COUNT(*)::int as count FROM story WHERE "authorId" = ${userId} AND published = true`),
    db.execute(sql`SELECT COUNT(*)::int as count FROM discussion_post WHERE author_id = ${userId}`),
    db.execute(sql`SELECT COUNT(*)::int as count FROM endeavor_member WHERE user_id = ${userId}`),
  ]);

  const badges = [];
  const ec = (endeavorCount.rows[0] as { count: number }).count;
  const sc = (storyCount.rows[0] as { count: number }).count;
  const dc = (discussionCount.rows[0] as { count: number }).count;
  const mc = (membershipCount.rows[0] as { count: number }).count;

  if (ec >= 1) badges.push({ key: "first-endeavor", name: "First Endeavor", icon: "★" });
  if (ec >= 5) badges.push({ key: "serial-creator", name: "Serial Creator", icon: "✦" });
  if (ec >= 10) badges.push({ key: "prolific-creator", name: "Prolific Creator", icon: "◆" });
  if (sc >= 1) badges.push({ key: "storyteller", name: "Storyteller", icon: "$" });
  if (sc >= 5) badges.push({ key: "chronicler", name: "Chronicler", icon: "$$" });
  if (dc >= 10) badges.push({ key: "conversationalist", name: "Conversationalist", icon: "#" });
  if (dc >= 50) badges.push({ key: "community-voice", name: "Community Voice", icon: "##" });
  if (mc >= 3) badges.push({ key: "collaborator", name: "Collaborator", icon: "@" });
  if (mc >= 10) badges.push({ key: "team-player", name: "Team Player", icon: "@@" });

  return NextResponse.json(badges);
}
