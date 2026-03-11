import crypto from "crypto";
import Link from "next/link";
import { db } from "@/lib/db";
import { endeavor, member } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

function generateInviteCode(endeavorId: string): string {
  return crypto
    .createHash("sha256")
    .update(endeavorId + "endeavor-invite-salt")
    .digest("hex")
    .slice(0, 8);
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ eid?: string }>;
}) {
  const { code } = await params;
  const { eid } = await searchParams;

  // Validate that we have an endeavor ID
  if (!eid) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
        <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
          <div className="border border-red-400/30 p-8 text-center">
            <p className="text-2xl mb-3 text-red-400">Invalid Invite</p>
            <p className="text-sm text-medium-gray mb-4">
              This invite link is invalid or has expired.
            </p>
            <Link
              href="/feed"
              className="text-xs text-code-green hover:underline"
            >
              Browse endeavors instead
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Verify the code matches what would be generated for this endeavor ID
  const expectedCode = generateInviteCode(eid);
  if (code !== expectedCode) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
        <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
          <div className="border border-red-400/30 p-8 text-center">
            <p className="text-2xl mb-3 text-red-400">Invalid Invite</p>
            <p className="text-sm text-medium-gray mb-4">
              This invite link is invalid or has expired.
            </p>
            <Link
              href="/feed"
              className="text-xs text-code-green hover:underline"
            >
              Browse endeavors instead
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fetch the endeavor details
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, eid))
    .limit(1);

  if (!end) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
        <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
          <div className="border border-red-400/30 p-8 text-center">
            <p className="text-2xl mb-3 text-red-400">Not Found</p>
            <p className="text-sm text-medium-gray mb-4">
              This endeavor no longer exists.
            </p>
            <Link
              href="/feed"
              className="text-xs text-code-green hover:underline"
            >
              Browse endeavors instead
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get member count
  const members = await db
    .select()
    .from(member)
    .where(eq(member.endeavorId, eid));
  const memberCount = members.filter((m) => m.status === "approved").length;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
      <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
        <div className="border border-medium-gray/20 overflow-hidden">
          {end.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={end.imageUrl}
              alt=""
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-code-green/5 text-6xl font-bold text-code-green/20">
              {end.title.charAt(0)}
            </div>
          )}
          <div className="p-6">
            <p className="mb-1 text-xs text-medium-gray">
              You&apos;ve been invited to join
            </p>
            <h1 className="mb-2 text-2xl font-bold">{end.title}</h1>
            {end.description && (
              <p className="mb-4 text-sm text-medium-gray line-clamp-3">
                {end.description}
              </p>
            )}
            <div className="mb-6 flex items-center gap-3 text-xs text-medium-gray">
              <span className="border border-code-green/30 px-2 py-0.5 text-code-green">
                {end.category}
              </span>
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>

            <Link
              href={`/endeavors/${eid}`}
              className="block w-full border border-code-green bg-code-green py-3 text-center text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              Join this Endeavor
            </Link>

            <p className="mt-3 text-center text-xs text-medium-gray">
              You&apos;ll be taken to the endeavor page to request to join.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
