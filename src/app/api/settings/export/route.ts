import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET /api/settings/export — download user settings & preferences as JSON
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const settingsExport = {
    _version: 1,
    _exportedAt: new Date().toISOString(),
    _type: "endeavor-settings",
    profile: {
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      skills: profile.skills,
      interests: profile.interests,
      website: profile.website,
      github: profile.github,
      twitter: profile.twitter,
      linkedin: profile.linkedin,
    },
    preferences: {
      // Client-side preferences are stored in localStorage,
      // but we include server-knowable defaults here as a
      // transport envelope so the client component can merge them.
    },
  };

  return new NextResponse(JSON.stringify(settingsExport, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="endeavor-settings-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
