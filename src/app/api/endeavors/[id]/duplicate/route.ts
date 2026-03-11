import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

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

  const [newEndeavor] = await db
    .insert(endeavor)
    .values({
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      location: original.location,
      locationType: original.locationType,
      needs: original.needs,
      costPerPerson: original.costPerPerson,
      capacity: original.capacity,
      fundingEnabled: original.fundingEnabled,
      fundingGoal: original.fundingGoal,
      imageUrl: original.imageUrl,
      joinType: original.joinType,
      status: "draft",
      creatorId: session.user.id,
    })
    .returning();

  // Auto-add creator as a member
  await db.insert(member).values({
    endeavorId: newEndeavor.id,
    userId: session.user.id,
    role: "creator",
    status: "approved",
  });

  return NextResponse.json(newEndeavor, { status: 201 });
}
