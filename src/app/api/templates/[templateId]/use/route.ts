import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { endeavor, member } from "@/lib/db/schema";
import { templates } from "../../route";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate template exists
  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, location, locationType: locType } = body;

  // Create the endeavor from template structure
  const [newEndeavor] = await db
    .insert(endeavor)
    .values({
      title: title || template.name,
      description: description || template.description,
      category: template.category,
      location: location || null,
      locationType: (locType as "in-person" | "remote" | "either") || template.locationType as "in-person" | "remote" | "either",
      needs: template.suggestedNeeds,
      capacity: template.suggestedCapacity,
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

  // Track template usage
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS template_use (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      endeavor_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    INSERT INTO template_use (template_id, user_id, endeavor_id)
    VALUES (${templateId}, ${session.user.id}, ${newEndeavor.id})
  `);

  // Create milestones from template (if milestone table exists)
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS milestone (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        endeavor_id UUID NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        position INT NOT NULL DEFAULT 0,
        completed BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    for (let i = 0; i < template.suggestedMilestones.length; i++) {
      await db.execute(sql`
        INSERT INTO milestone (endeavor_id, title, position)
        VALUES (${newEndeavor.id}, ${template.suggestedMilestones[i]}, ${i})
      `);
    }
  } catch {
    // Milestone creation is best-effort
  }

  return NextResponse.json(
    { endeavor: newEndeavor, templateId },
    { status: 201 }
  );
}
