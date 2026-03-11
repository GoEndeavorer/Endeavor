import Link from "next/link";
import { db } from "@/lib/db";
import { endeavor, member, inviteLink } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Look up the invite link by code
  const [link] = await db
    .select()
    .from(inviteLink)
    .where(eq(inviteLink.code, code))
    .limit(1);

  if (!link) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
        <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
          <div className="border border-red-400/30 p-8 text-center">
            <p className="text-2xl mb-3 text-red-400">Invalid Invite</p>
            <p className="text-sm text-medium-gray mb-4">
              This invite link is invalid or has expired.
            </p>
            <Link href="/feed" className="text-xs text-code-green hover:underline">
              Browse endeavors instead
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check expiry
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
        <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
          <div className="border border-yellow-400/30 p-8 text-center">
            <p className="text-2xl mb-3 text-yellow-400">Invite Expired</p>
            <p className="text-sm text-medium-gray mb-4">
              This invite link has expired. Ask the organizer for a new one.
            </p>
            <Link href="/feed" className="text-xs text-code-green hover:underline">
              Browse endeavors instead
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check max uses
  if (link.maxUses && link.useCount >= link.maxUses) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
        <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
          <div className="border border-yellow-400/30 p-8 text-center">
            <p className="text-2xl mb-3 text-yellow-400">Invite Full</p>
            <p className="text-sm text-medium-gray mb-4">
              This invite link has reached its maximum number of uses.
            </p>
            <Link href="/feed" className="text-xs text-code-green hover:underline">
              Browse endeavors instead
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fetch the endeavor
  const [end] = await db
    .select()
    .from(endeavor)
    .where(eq(endeavor.id, link.endeavorId))
    .limit(1);

  if (!end) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
        <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
          <div className="border border-red-400/30 p-8 text-center">
            <p className="text-2xl mb-3 text-red-400">Not Found</p>
            <p className="text-sm text-medium-gray mb-4">This endeavor no longer exists.</p>
            <Link href="/feed" className="text-xs text-code-green hover:underline">
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
    .where(eq(member.endeavorId, link.endeavorId));
  const memberCount = members.filter((m) => m.status === "approved").length;

  // Increment use count
  await db
    .update(inviteLink)
    .set({ useCount: sql`${inviteLink.useCount} + 1` })
    .where(eq(inviteLink.id, link.id));

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
      <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
        <div className="border border-medium-gray/20 overflow-hidden">
          {end.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={end.imageUrl} alt="" className="h-48 w-full object-cover" />
          ) : (
            <div className="flex h-48 items-center justify-center bg-code-green/5 text-6xl font-bold text-code-green/20">
              {end.title.charAt(0)}
            </div>
          )}
          <div className="p-6">
            <p className="mb-1 text-xs text-code-green uppercase tracking-wider">
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
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
              {end.location && <span>{end.location}</span>}
            </div>

            {end.needs && end.needs.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 text-xs text-medium-gray">Looking for:</p>
                <div className="flex flex-wrap gap-1.5">
                  {end.needs.map((need) => (
                    <span key={need} className="bg-white/5 px-2 py-0.5 text-xs text-light-gray">
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={`/endeavors/${end.id}`}
              className="block w-full border border-code-green bg-code-green py-3 text-center text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              View &amp; Join this Endeavor
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
