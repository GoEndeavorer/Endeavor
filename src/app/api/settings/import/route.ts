import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

// Fields that are safe to update via import — never id, email, emailVerified
const SAFE_PROFILE_FIELDS = [
  "name",
  "bio",
  "location",
  "skills",
  "interests",
  "website",
  "github",
  "twitter",
  "linkedin",
] as const;

type SafeField = (typeof SAFE_PROFILE_FIELDS)[number];

function isValidSettingsPayload(
  data: unknown
): data is {
  _version: number;
  _type: string;
  profile?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
} {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (obj._type !== "endeavor-settings") return false;
  if (typeof obj._version !== "number") return false;
  if (obj.profile !== undefined && typeof obj.profile !== "object") return false;
  return true;
}

function sanitizeProfileUpdates(
  profile: Record<string, unknown>
): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  for (const field of SAFE_PROFILE_FIELDS) {
    if (profile[field] === undefined) continue;
    const value = profile[field];

    switch (field) {
      case "name":
        if (typeof value === "string" && value.trim()) {
          updates.name = value.trim();
        }
        break;
      case "bio":
      case "location":
      case "website":
      case "github":
      case "twitter":
      case "linkedin":
        if (typeof value === "string") {
          updates[field] = value || null;
        }
        break;
      case "skills":
      case "interests":
        if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
          updates[field] = value;
        }
        break;
    }
  }

  return updates;
}

// POST /api/settings/import — import settings from JSON payload
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!isValidSettingsPayload(body)) {
    return NextResponse.json(
      {
        error:
          "Invalid settings file. Expected an Endeavor settings export with _type and _version fields.",
      },
      { status: 400 }
    );
  }

  const appliedFields: string[] = [];

  // Apply profile updates
  if (body.profile && typeof body.profile === "object") {
    const updates = sanitizeProfileUpdates(
      body.profile as Record<string, unknown>
    );

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();

      await db
        .update(user)
        .set(updates)
        .where(eq(user.id, session.user.id));

      appliedFields.push(...Object.keys(updates).filter((k) => k !== "updatedAt"));
    }
  }

  return NextResponse.json({
    success: true,
    appliedFields,
    preferences: body.preferences ?? {},
  });
}
