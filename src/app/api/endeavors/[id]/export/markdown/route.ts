import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { endeavor, member, user, task, milestone, discussion } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify membership
  const [membership] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.endeavorId, id),
        eq(member.userId, session.user.id),
        eq(member.status, "approved")
      )
    )
    .limit(1);

  if (!membership) {
    return NextResponse.json(
      { error: "You must be a member to export this endeavor" },
      { status: 403 }
    );
  }

  // Fetch endeavor details
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Endeavor not found" }, { status: 404 });
  }

  // Fetch all data in parallel
  const [members, tasks, milestones, discussions] = await Promise.all([
    db
      .select({
        name: user.name,
        role: member.role,
        joinedAt: member.joinedAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(and(eq(member.endeavorId, id), eq(member.status, "approved"))),
    db.select().from(task).where(eq(task.endeavorId, id)),
    db.select().from(milestone).where(eq(milestone.endeavorId, id)),
    db
      .select({
        content: discussion.content,
        authorName: user.name,
        createdAt: discussion.createdAt,
      })
      .from(discussion)
      .innerJoin(user, eq(discussion.authorId, user.id))
      .where(eq(discussion.endeavorId, id))
      .orderBy(desc(discussion.createdAt))
      .limit(50),
  ]);

  // Build Markdown document
  const lines: string[] = [];

  // Title and description
  lines.push(`# ${end.title}`);
  lines.push("");
  lines.push(end.description);
  lines.push("");

  // Metadata
  lines.push("## Details");
  lines.push("");
  lines.push(`- **Category:** ${end.category}`);
  lines.push(`- **Status:** ${end.status}`);
  if (end.location) {
    lines.push(`- **Location:** ${end.location}`);
  }
  lines.push(`- **Location Type:** ${end.locationType}`);
  lines.push(`- **Created:** ${end.createdAt.toISOString().split("T")[0]}`);
  lines.push("");

  // Members
  lines.push("## Members");
  lines.push("");
  if (members.length === 0) {
    lines.push("_No members yet._");
  } else {
    lines.push("| Name | Role | Joined |");
    lines.push("|------|------|--------|");
    members.forEach((m) => {
      const joined = m.joinedAt.toISOString().split("T")[0];
      lines.push(`| ${m.name} | ${m.role} | ${joined} |`);
    });
  }
  lines.push("");

  // Tasks
  lines.push("## Tasks");
  lines.push("");
  if (tasks.length === 0) {
    lines.push("_No tasks yet._");
  } else {
    lines.push("| Task | Status | Due Date |");
    lines.push("|------|--------|----------|");
    tasks.forEach((t) => {
      const due = t.dueDate ? t.dueDate.toISOString().split("T")[0] : "N/A";
      const statusIcon =
        t.status === "done" ? "[x]" : t.status === "in-progress" ? "[-]" : "[ ]";
      lines.push(`| ${statusIcon} ${t.title} | ${t.status} | ${due} |`);
    });
  }
  lines.push("");

  // Milestones
  lines.push("## Milestones");
  lines.push("");
  if (milestones.length === 0) {
    lines.push("_No milestones yet._");
  } else {
    lines.push("| Milestone | Completed | Target Date |");
    lines.push("|-----------|-----------|-------------|");
    milestones.forEach((m) => {
      const target = m.targetDate
        ? m.targetDate.toISOString().split("T")[0]
        : "N/A";
      const status = m.completed ? "Yes" : "No";
      lines.push(`| ${m.title} | ${status} | ${target} |`);
    });
  }
  lines.push("");

  // Recent Discussions
  lines.push("## Recent Discussions");
  lines.push("");
  if (discussions.length === 0) {
    lines.push("_No discussions yet._");
  } else {
    discussions.forEach((d) => {
      const date = d.createdAt.toISOString().split("T")[0];
      lines.push(`> **${d.authorName}** (${date}):`);
      lines.push(`> ${d.content}`);
      lines.push("");
    });
  }

  // Footer
  lines.push("---");
  lines.push(
    `_Exported from Endeavor on ${new Date().toISOString().split("T")[0]}_`
  );

  const markdown = lines.join("\n");
  const safeName = end.title.replace(/[^a-z0-9]/gi, "_");

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="${safeName}.md"`,
    },
  });
}
