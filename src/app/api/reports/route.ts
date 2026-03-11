import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { report } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["endeavor", "user", "discussion", "story"];
const VALID_REASONS = ["spam", "harassment", "inappropriate", "scam", "other"];

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { targetType, targetId, reason, description } = body;

  // Backwards compat: if old-style request with endeavorId/details
  const finalTargetType = targetType || (body.endeavorId ? "endeavor" : null);
  const finalTargetId = targetId || body.endeavorId;
  const finalReason = reason || body.reason;
  const finalDescription = description || body.details;

  if (!finalTargetType || !VALID_TYPES.includes(finalTargetType)) {
    return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
  }
  if (!finalReason?.trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }
  if (!finalTargetId) {
    return NextResponse.json({ error: "Target ID required" }, { status: 400 });
  }

  const [created] = await db
    .insert(report)
    .values({
      reporterId: session.user.id,
      targetType: finalTargetType,
      targetId: finalTargetId,
      reason: VALID_REASONS.includes(finalReason) ? finalReason : "other",
      description: finalDescription?.trim() || null,
    })
    .returning();

  return NextResponse.json(
    { ...created, message: "Report submitted. Thank you." },
    { status: 201 }
  );
}
