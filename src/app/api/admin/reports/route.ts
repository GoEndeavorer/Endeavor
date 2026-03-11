import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { report, user, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);

async function isAdmin(email: string) {
  return ADMIN_EMAILS.includes(email);
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await db
    .select({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      description: report.description,
      status: report.status,
      createdAt: report.createdAt,
      resolvedAt: report.resolvedAt,
      reporterName: user.name,
      reporterEmail: user.email,
      targetTitle: sql<string | null>`
        CASE
          WHEN ${report.targetType} = 'endeavor' THEN (
            SELECT ${endeavor.title} FROM ${endeavor} WHERE ${endeavor.id}::text = ${report.targetId}
          )
          WHEN ${report.targetType} = 'user' THEN (
            SELECT ${user.name} FROM ${user} WHERE ${user.id} = ${report.targetId}
          )
          ELSE NULL
        END
      `,
    })
    .from(report)
    .innerJoin(user, eq(report.reporterId, user.id))
    .orderBy(desc(report.createdAt));

  return NextResponse.json(reports);
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId, status } = await request.json();
  if (!reportId || !["reviewed", "resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [updated] = await db
    .update(report)
    .set({
      status,
      reviewedById: session.user.id,
      resolvedAt: status === "resolved" || status === "dismissed" ? new Date() : null,
    })
    .where(eq(report.id, reportId))
    .returning();

  return NextResponse.json(updated);
}
