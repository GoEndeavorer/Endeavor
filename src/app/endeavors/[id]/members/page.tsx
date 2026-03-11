"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type Member = {
  id: string;
  role: string;
  status: string;
  joinedAt: string;
  userId: string;
  userName: string;
  userImage: string | null;
};

export default function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [members, setMembers] = useState<Member[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/endeavors/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setTitle(data.title);
          setMembers(data.members || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const filtered = members.filter((m) =>
    m.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{ label: title || "Members", href: `/endeavors/${id}` }}
      />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        {loading ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-sm text-medium-gray">Loading members...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-2xl font-bold">Members</h1>
              <p className="text-sm text-medium-gray">
                {members.length} member{members.length !== 1 ? "s" : ""} of{" "}
                <Link
                  href={`/endeavors/${id}`}
                  className="text-code-blue hover:text-code-green"
                >
                  {title}
                </Link>
              </p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-medium-gray">
                {"// filter members"}
              </p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full border border-medium-gray/20 bg-transparent px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-code-green/50 placeholder:text-medium-gray/50"
              />
            </div>

            {/* Member grid */}
            {filtered.length === 0 ? (
              <div className="border border-medium-gray/20 p-12 text-center">
                <p className="text-sm text-medium-gray">
                  {search
                    ? `No members matching "${search}"`
                    : "No members yet."}
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-medium-gray">
                  {"// directory"}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((m) => (
                    <Link
                      key={m.id}
                      href={`/users/${m.userId}`}
                      className="group border border-medium-gray/20 p-5 transition-colors hover:border-code-green/50"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar initial */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center text-sm font-bold ${
                            m.role === "creator"
                              ? "bg-code-green/10 text-code-green"
                              : "bg-code-blue/10 text-code-blue"
                          }`}
                        >
                          {m.userName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Name */}
                          <p className="truncate font-semibold group-hover:text-code-green transition-colors">
                            {m.userName}
                          </p>

                          {/* Role badge */}
                          <span
                            className={`mt-1 inline-block text-xs font-semibold uppercase tracking-widest ${
                              m.role === "creator"
                                ? "text-code-green"
                                : "text-code-blue"
                            }`}
                          >
                            {m.role}
                          </span>

                          {/* Join date */}
                          <p className="mt-2 text-xs text-medium-gray">
                            Joined {formatTimeAgo(m.joinedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
