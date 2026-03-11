import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { onboardingStep, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: get completed onboarding steps
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const steps = await db
    .select({ step: onboardingStep.step })
    .from(onboardingStep)
    .where(eq(onboardingStep.userId, session.user.id));

  return NextResponse.json({
    completedSteps: steps.map((s) => s.step),
  });
}

// POST: mark a step as complete
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { step } = await request.json();
  const validSteps = ["welcome", "profile", "explore", "join", "create"];

  if (!validSteps.includes(step)) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  // Upsert
  const existing = await db
    .select()
    .from(onboardingStep)
    .where(eq(onboardingStep.userId, session.user.id));

  if (!existing.find((s) => s.step === step)) {
    await db.insert(onboardingStep).values({
      userId: session.user.id,
      step,
    });
  }

  return NextResponse.json({ success: true });
}
