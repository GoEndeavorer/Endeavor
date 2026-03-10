"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

type Endeavor = {
  id: string;
  title: string;
  category: string;
  status: string;
  memberCount: number;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [endeavors, setEndeavors] = useState<Endeavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchMyEndeavors() {
      try {
        const res = await fetch("/api/endeavors?mine=true");
        if (res.ok) {
          setEndeavors(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch endeavors:", err);
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchMyEndeavors();
  }, [session]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Endeavor
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/feed"
              className="text-sm text-code-blue hover:text-code-green"
            >
              Feed
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-medium-gray hover:text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center bg-accent text-2xl font-bold">
            {session.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="text-sm text-medium-gray">{session.user.email}</p>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-code-green">
            {"// my endeavors"}
          </h2>
          <Link
            href="/endeavors/create"
            className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
          >
            + New Endeavor
          </Link>
        </div>

        {loading ? (
          <p className="text-medium-gray">Loading...</p>
        ) : endeavors.length === 0 ? (
          <div className="border border-medium-gray/30 p-8 text-center">
            <p className="mb-4 text-medium-gray">
              You haven&apos;t created or joined any endeavors yet.
            </p>
            <Link
              href="/feed"
              className="text-code-blue hover:text-code-green"
            >
              Explore endeavors
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {endeavors.map((e) => (
              <Link
                key={e.id}
                href={`/endeavors/${e.id}`}
                className="flex items-center justify-between border border-medium-gray/30 p-4 transition-colors hover:border-code-green/50"
              >
                <div>
                  <h3 className="font-bold">{e.title}</h3>
                  <p className="text-xs text-medium-gray">
                    {e.category} &middot; {e.memberCount} members &middot;{" "}
                    {e.status}
                  </p>
                </div>
                <span className="text-xs text-code-blue">View &rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
