import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member, task, milestone, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!end) {
    return NextResponse.json({ error: "Endeavor not found" }, { status: 404 });
  }

  // Only approved members can export
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
      { error: "Only approved members can export" },
      { status: 403 }
    );
  }

  const [tasks, milestones, members] = await Promise.all([
    db
      .select()
      .from(task)
      .where(eq(task.endeavorId, id))
      .orderBy(desc(task.createdAt)),
    db
      .select()
      .from(milestone)
      .where(eq(milestone.endeavorId, id))
      .orderBy(milestone.createdAt),
    db
      .select({ name: user.name, email: user.email, role: member.role, status: member.status })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.endeavorId, id)),
  ]);

  const lines: string[] = [];

  // Tasks section
  lines.push("TASKS");
  lines.push("Title,Status,Priority,Due Date,Created");
  for (const t of tasks) {
    lines.push(
      [
        csvEscape(t.title),
        t.status,
        t.priority || "",
        t.dueDate || "",
        t.createdAt?.toISOString?.() || String(t.createdAt),
      ].join(",")
    );
  }

  lines.push("");
  lines.push("MILESTONES");
  lines.push("Title,Target Date,Completed,Completed At");
  for (const m of milestones) {
    lines.push(
      [
        csvEscape(m.title),
        m.targetDate || "",
        m.completed ? "Yes" : "No",
        m.completedAt?.toISOString?.() || String(m.completedAt || ""),
      ].join(",")
    );
  }

  lines.push("");
  lines.push("MEMBERS");
  lines.push("Name,Email,Role,Status");
  for (const m of members) {
    lines.push(
      [csvEscape(m.name), m.email, m.role, m.status].join(",")
    );
  }

  const safeName = end.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="endeavor-${safeName}.csv"`,
    },
  });
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
