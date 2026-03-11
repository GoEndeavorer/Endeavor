"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type GroupMember = {
  user_id: string;
  name: string;
  image: string | null;
  role: string;
  joined_at: string;
};

type Group = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  privacy: string;
  member_count: number;
  creator_id: string;
  creator_name: string;
  created_at: string;
  members: GroupMember[];
};

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/${groupId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setGroup)
      .finally(() => setLoading(false));
  }, [groupId]);

  const isMember = group?.members?.some((m) => m.user_id === session?.user?.id);

  async function joinGroup() {
    setJoining(true);
    const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" });
    if (res.ok) {
      setGroup((g) =>
        g ? {
          ...g,
          member_count: g.member_count + 1,
          members: [...g.members, {
            user_id: session!.user.id,
            name: session!.user.name,
            image: null,
            role: "member",
            joined_at: new Date().toISOString(),
          }],
        } : g
      );
      toast("Joined group!", "success");
    }
    setJoining(false);
  }

  async function leaveGroup() {
    const res = await fetch(`/api/groups/${groupId}/join`, { method: "DELETE" });
    if (res.ok) {
      setGroup((g) =>
        g ? {
          ...g,
          member_count: g.member_count - 1,
          members: g.members.filter((m) => m.user_id !== session?.user?.id),
        } : g
      );
      toast("Left group", "success");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Groups", href: "/groups" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Groups", href: "/groups" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Group not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Groups", href: "/groups" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-1.5 py-0.5 border border-code-blue/20 text-code-blue">
                {group.category}
              </span>
              {group.privacy !== "public" && (
                <span className="text-xs px-1.5 py-0.5 border border-yellow-400/20 text-yellow-400">
                  {group.privacy}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-medium-gray mt-1">{group.description}</p>
            )}
            <p className="text-xs text-medium-gray mt-2">
              Created by{" "}
              <Link href={`/users/${group.creator_id}`} className="text-code-blue hover:text-code-green">
                {group.creator_name}
              </Link>{" "}
              · {formatTimeAgo(group.created_at)} · {group.member_count} member{group.member_count !== 1 ? "s" : ""}
            </p>
          </div>
          {session && (
            isMember ? (
              group.creator_id !== session.user.id && (
                <button
                  onClick={leaveGroup}
                  className="px-4 py-2 text-xs font-semibold border border-red-400/50 text-red-400 hover:bg-red-400 hover:text-black transition-colors"
                >
                  Leave
                </button>
              )
            ) : (
              <button
                onClick={joinGroup}
                disabled={joining}
                className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors disabled:opacity-50"
              >
                {joining ? "Joining..." : "Join Group"}
              </button>
            )
          )}
        </div>

        {/* Members */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
            {"// members"}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.members.map((m) => (
              <Link
                key={m.user_id}
                href={`/users/${m.user_id}`}
                className="flex items-center gap-3 border border-medium-gray/20 p-3 hover:border-code-green/30 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center border border-code-green/20 text-code-green text-xs font-bold">
                  {m.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-light-gray truncate">{m.name}</p>
                  <div className="flex items-center gap-2">
                    {m.role !== "member" && (
                      <span className="text-xs text-code-blue">{m.role}</span>
                    )}
                    <span className="text-xs text-medium-gray">{formatTimeAgo(m.joined_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
