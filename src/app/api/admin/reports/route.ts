import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { report, user, endeavor } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, sql } from "drizzle-orm";

// Simple admin check — in production, add a proper admin role
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
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
      reporterName: user.name,
      reporterEmail: user.email,
      endeavorId: report.endeavorId,
      endeavorTitle: endeavor.title,
    })
    .from(report)
    .innerJoin(user, eq(report.reporterId, user.id))
    .leftJoin(endeavor, eq(report.endeavorId, endeavor.id))
    .orderBy(desc(report.createdAt));

  return NextResponse.json(reports);
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isAdmin(session.user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId, status } = await request.json();
  if (!reportId || !["reviewed", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [updated] = await db
    .update(report)
    .set({ status })
    .where(eq(report.id, reportId))
    .returning();

  return NextResponse.json(updated);
}
