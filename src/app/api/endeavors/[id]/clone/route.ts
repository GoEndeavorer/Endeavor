import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// POST — clone an endeavor as a new draft
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [original] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, id))
    .limit(1);

  if (!original) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [cloned] = await db
    .insert(endeavor)
    .values({
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      location: original.location,
      locationType: original.locationType,
      needs: original.needs,
      status: "draft",
      costPerPerson: original.costPerPerson,
      capacity: original.capacity,
      fundingEnabled: original.fundingEnabled,
      fundingGoal: original.fundingGoal,
      fundingRaised: 0,
      imageUrl: original.imageUrl,
      joinType: original.joinType,
      creatorId: session.user.id,
    })
    .returning();

  // Add creator as member
  await db.insert(member).values({
    endeavorId: cloned.id,
    userId: session.user.id,
    role: "creator",
    status: "approved",
  });

  return NextResponse.json(cloned, { status: 201 });
}
