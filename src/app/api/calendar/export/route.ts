import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { task, milestone, event, member, endeavor } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's endeavor IDs
  const memberships = await db
    .select({ endeavorId: member.endeavorId })
    .from(member)
    .where(
      and(eq(member.userId, session.user.id), eq(member.status, "approved"))
    );

  const endeavorIds = memberships.map((m) => m.endeavorId);

  if (endeavorIds.length === 0) {
    const emptyCalendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Endeavor//Calendar//EN",
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(emptyCalendar, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": 'attachment; filename="endeavor_calendar.ics"',
      },
    });
  }

  // Fetch tasks with due dates
  const tasks = await db
    .select({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      endeavorId: task.endeavorId,
      endeavorTitle: endeavor.title,
    })
    .from(task)
    .innerJoin(endeavor, eq(task.endeavorId, endeavor.id))
    .where(isNotNull(task.dueDate));

  // Fetch milestones with target dates
  const milestones = await db
    .select({
      id: milestone.id,
      title: milestone.title,
      targetDate: milestone.targetDate,
      endeavorId: milestone.endeavorId,
      endeavorTitle: endeavor.title,
    })
    .from(milestone)
    .innerJoin(endeavor, eq(milestone.endeavorId, endeavor.id))
    .where(isNotNull(milestone.targetDate));

  // Fetch events
  const events = await db
    .select({
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      endeavorId: event.endeavorId,
      endeavorTitle: endeavor.title,
    })
    .from(event)
    .innerJoin(endeavor, eq(event.endeavorId, endeavor.id));

  // Build ICS content
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Endeavor//Calendar//EN",
  ];

  // Add tasks
  tasks
    .filter((t) => endeavorIds.includes(t.endeavorId))
    .forEach((t) => {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:task-${t.id}@endeavor`);
      lines.push(`DTSTART:${formatICSDate(t.dueDate!)}`);
      lines.push(`SUMMARY:${escapeICS(t.title)}`);
      lines.push(`DESCRIPTION:Endeavor: ${escapeICS(t.endeavorTitle)}`);
      lines.push("END:VEVENT");
    });

  // Add milestones
  milestones
    .filter((m) => endeavorIds.includes(m.endeavorId))
    .forEach((m) => {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:milestone-${m.id}@endeavor`);
      lines.push(`DTSTART:${formatICSDate(m.targetDate!)}`);
      lines.push(`SUMMARY:${escapeICS(m.title)}`);
      lines.push(`DESCRIPTION:Endeavor: ${escapeICS(m.endeavorTitle)}`);
      lines.push("END:VEVENT");
    });

  // Add events
  events
    .filter((e) => endeavorIds.includes(e.endeavorId))
    .forEach((e) => {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:event-${e.id}@endeavor`);
      lines.push(`DTSTART:${formatICSDate(e.startsAt)}`);
      if (e.endsAt) {
        lines.push(`DTEND:${formatICSDate(e.endsAt)}`);
      }
      lines.push(`SUMMARY:${escapeICS(e.title)}`);
      const desc = e.description
        ? `${escapeICS(e.description)}\\nEndeavor: ${escapeICS(e.endeavorTitle)}`
        : `Endeavor: ${escapeICS(e.endeavorTitle)}`;
      lines.push(`DESCRIPTION:${desc}`);
      lines.push("END:VEVENT");
    });

  lines.push("END:VCALENDAR");

  const icsContent = lines.join("\r\n");

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": 'attachment; filename="endeavor_calendar.ics"',
    },
  });
}
