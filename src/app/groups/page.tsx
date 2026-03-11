"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Group = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  privacy: string;
  member_count: number;
  creator_name: string;
  created_at: string;
};

const categories = ["all", "general", "tech", "design", "business", "science", "arts", "education", "social"];

export default function GroupsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupCategory, setGroupCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = category === "all" ? "/api/groups" : `/api/groups?category=${category}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setGroups)
      .finally(() => setLoading(false));
  }, [category]);

  async function createGroup() {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description || undefined, category: groupCategory }),
    });
    if (res.ok) {
      const g = await res.json();
      setGroups((prev) => [{ ...g, creator_name: session!.user.name }, ...prev]);
      setName("");
      setDescription("");
      setShowForm(false);
      toast("Group created!", "success");
    }
    setSubmitting(false);
  }

  async function joinGroup(groupId: string) {
    setJoining(groupId);
    const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" });
    if (res.ok) {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, member_count: g.member_count + 1 } : g))
      );
      toast("Joined group!", "success");
    }
    setJoining(null);
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Groups", href: "/groups" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Groups</h1>
            <p className="text-sm text-medium-gray">Communities of creators and collaborators</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
            >
              {showForm ? "Cancel" : "Create Group"}
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-code-green text-black"
                  : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// create group"}
            </h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <select
              value={groupCategory}
              onChange={(e) => setGroupCategory(e.target.value)}
              className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
            >
              {categories.filter((c) => c !== "all").map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={createGroup}
              disabled={submitting || !name.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Group"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : groups.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No groups in this category yet.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((g) => (
              <div key={g.id} className="border border-medium-gray/20 p-4 hover:border-code-green/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 border border-code-blue/20 text-code-blue">
                        {g.category}
                      </span>
                      {g.privacy !== "public" && (
                        <span className="text-xs px-1.5 py-0.5 border border-yellow-400/20 text-yellow-400">
                          {g.privacy}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-light-gray">{g.name}</h3>
                  </div>
                </div>
                {g.description && (
                  <p className="text-xs text-medium-gray line-clamp-2 mb-2">{g.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-medium-gray">
                    {g.member_count} member{g.member_count !== 1 ? "s" : ""} · {formatTimeAgo(g.created_at)}
                  </span>
                  {session && (
                    <button
                      onClick={() => joinGroup(g.id)}
                      disabled={joining === g.id}
                      className="px-3 py-1 text-xs font-semibold border border-code-green/50 text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
                    >
                      {joining === g.id ? "..." : "Join"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
