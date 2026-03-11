"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Forum = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  post_count: number;
  created_by: string;
  creator_name: string;
  created_at: string;
};

const CATEGORIES = [
  "general",
  "projects",
  "feedback",
  "help",
  "showcase",
  "off-topic",
];

export default function ForumsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const url = activeCategory
      ? `/api/forums?category=${activeCategory}`
      : "/api/forums";
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setForums)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  async function createForum() {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/forums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description || undefined,
        category,
      }),
    });
    if (res.ok) {
      const forum = await res.json();
      setForums((prev) => [
        { ...forum, creator_name: session!.user.name, post_count: 0 },
        ...prev,
      ]);
      setName("");
      setDescription("");
      setCategory("general");
      setShowForm(false);
      toast("Forum created!", "success");
    } else {
      toast("Failed to create forum", "error");
    }
    setSubmitting(false);
  }

  const grouped = forums.reduce(
    (acc, f) => {
      const cat = f.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(f);
      return acc;
    },
    {} as Record<string, Forum[]>
  );

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Forums", href: "/forums" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">Forums</h1>
            <p className="text-sm text-medium-gray">
              Discuss ideas, ask questions, and share knowledge
            </p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="border border-code-green px-4 py-2 text-sm text-code-green transition-colors hover:bg-code-green hover:text-black"
            >
              {showForm ? "Cancel" : "+ New Forum"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-8 border border-medium-gray/20 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// create forum"}
            </p>
            <input
              type="text"
              placeholder="Forum name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3 w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-code-green"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mb-3 w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-code-green"
            />
            <div className="mb-4 flex items-center gap-3">
              <label className="text-xs text-medium-gray">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-medium-gray/30 bg-black px-2 py-1 text-sm text-white outline-none focus:border-code-green"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={createForum}
              disabled={submitting || !name.trim()}
              className="border border-code-green px-4 py-2 text-sm text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Forum"}
            </button>
          </div>
        )}

        {/* Category filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveCategory(null);
              setLoading(true);
            }}
            className={`border px-3 py-1 text-xs transition-colors ${
              activeCategory === null
                ? "border-code-green bg-code-green text-black"
                : "border-medium-gray/30 text-medium-gray hover:border-code-green hover:text-code-green"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setActiveCategory(c);
                setLoading(true);
              }}
              className={`border px-3 py-1 text-xs transition-colors ${
                activeCategory === c
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/30 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-medium-gray">
            Loading forums...
          </div>
        ) : forums.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="mb-2 text-medium-gray">No forums yet</p>
            <p className="text-sm text-medium-gray/60">
              Create a forum to start a discussion
            </p>
          </div>
        ) : activeCategory ? (
          <div className="space-y-3">
            {forums.map((f) => (
              <ForumRow key={f.id} forum={f} />
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catForums]) => (
            <div key={cat} className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// " + cat}
              </p>
              <div className="space-y-3">
                {catForums.map((f) => (
                  <ForumRow key={f.id} forum={f} />
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}

function ForumRow({ forum }: { forum: Forum }) {
  return (
    <Link
      href={`/forums/${forum.id}`}
      className="group flex items-center justify-between border border-medium-gray/20 p-4 transition-colors hover:border-code-green/50"
    >
      <div className="min-w-0">
        <h3 className="text-sm font-medium group-hover:text-code-green">
          {forum.name}
        </h3>
        {forum.description && (
          <p className="mt-1 truncate text-xs text-medium-gray">
            {forum.description}
          </p>
        )}
        <p className="mt-1 text-xs text-medium-gray/60">
          by {forum.creator_name} &middot; {formatTimeAgo(forum.created_at)}
        </p>
      </div>
      <div className="ml-4 shrink-0 text-right">
        <p className="text-lg font-bold text-code-blue">{forum.post_count}</p>
        <p className="text-xs text-medium-gray">
          {forum.post_count === 1 ? "post" : "posts"}
        </p>
      </div>
    </Link>
  );
}
