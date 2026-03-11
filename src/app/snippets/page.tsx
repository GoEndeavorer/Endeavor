"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Snippet = {
  id: string;
  author_id: string;
  title: string | null;
  description: string | null;
  code: string;
  language: string;
  visibility: string;
  fork_count: number;
  like_count: number;
  created_at: string;
  author_name: string;
  author_image: string | null;
};

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "html",
  "css",
  "sql",
  "bash",
  "json",
  "yaml",
  "other",
];

const LANG_COLORS: Record<string, string> = {
  javascript: "#f7df1e",
  typescript: "#3178c6",
  python: "#3572A5",
  rust: "#dea584",
  go: "#00ADD8",
  java: "#b07219",
  c: "#555555",
  cpp: "#f34b7d",
  html: "#e34c26",
  css: "#563d7c",
  sql: "#e38c00",
  bash: "#89e051",
  json: "#292929",
  yaml: "#cb171e",
  other: "#666666",
};

export default function SnippetsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSnippets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeLanguage) params.set("language", activeLanguage);
    if (searchDebounced) params.set("search", searchDebounced);
    const url = `/api/snippets${params.toString() ? "?" + params.toString() : ""}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setSnippets)
      .finally(() => setLoading(false));
  }, [activeLanguage, searchDebounced]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  async function createSnippet() {
    if (!code.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/snippets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || undefined,
        description: description || undefined,
        code,
        language,
      }),
    });
    if (res.ok) {
      const snippet = await res.json();
      setSnippets((prev) => [
        {
          ...snippet,
          author_name: session!.user.name,
          author_image: null,
          like_count: 0,
          fork_count: 0,
        },
        ...prev,
      ]);
      setTitle("");
      setDescription("");
      setCode("");
      setLanguage("javascript");
      setShowForm(false);
      toast("Snippet created!", "success");
    } else {
      toast("Failed to create snippet", "error");
    }
    setSubmitting(false);
  }

  async function toggleLike(snippetId: string) {
    if (!session) {
      toast("Sign in to like snippets", "error");
      return;
    }
    const res = await fetch(`/api/snippets/${snippetId}/like`, {
      method: "POST",
    });
    if (res.ok) {
      const { action } = await res.json();
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === snippetId
            ? {
                ...s,
                like_count:
                  action === "liked" ? s.like_count + 1 : s.like_count - 1,
              }
            : s
        )
      );
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Snippets", href: "/snippets" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">Code Snippets</h1>
            <p className="text-sm text-medium-gray">
              Share and discover useful code snippets
            </p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="border border-code-green px-4 py-2 text-sm text-code-green transition-colors hover:bg-code-green hover:text-black"
            >
              {showForm ? "Cancel" : "+ New Snippet"}
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-8 border border-medium-gray/20 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// new snippet"}
            </p>
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-3 w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-code-green"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-3 w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-code-green"
            />
            <div className="mb-3 flex items-center gap-3">
              <label className="text-xs text-medium-gray">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-medium-gray/30 bg-black px-2 py-1 text-sm text-white outline-none focus:border-code-green"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={10}
              className="mb-4 w-full border border-medium-gray/30 bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-code-green outline-none focus:border-code-green"
              spellCheck={false}
            />
            <button
              onClick={createSnippet}
              disabled={submitting || !code.trim()}
              className="border border-code-green px-4 py-2 text-sm text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Snippet"}
            </button>
          </div>
        )}

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-code-green"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveLanguage(null)}
              className={`border px-3 py-1 text-xs transition-colors ${
                activeLanguage === null
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/30 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              All
            </button>
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() =>
                  setActiveLanguage(activeLanguage === l ? null : l)
                }
                className={`border px-3 py-1 text-xs transition-colors ${
                  activeLanguage === l
                    ? "border-code-green bg-code-green text-black"
                    : "border-medium-gray/30 text-medium-gray hover:border-code-green hover:text-code-green"
                }`}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: LANG_COLORS[l] || "#666" }}
                />
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Snippets list */}
        {loading ? (
          <div className="py-16 text-center text-sm text-medium-gray">
            Loading snippets...
          </div>
        ) : snippets.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="mb-2 text-medium-gray">No snippets found</p>
            <p className="text-sm text-medium-gray/60">
              {search || activeLanguage
                ? "Try adjusting your search or filters"
                : "Be the first to share a code snippet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onLike={() => toggleLike(snippet.id)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function SnippetCard({
  snippet,
  onLike,
}: {
  snippet: Snippet;
  onLike: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const lines = snippet.code.split("\n");
  const previewLines = lines.slice(0, 8);
  const hasMore = lines.length > 8;

  function copyCode() {
    navigator.clipboard.writeText(snippet.code).then(() => {
      toast("Copied to clipboard!", "success");
    });
  }

  return (
    <div className="border border-medium-gray/20 transition-colors hover:border-medium-gray/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-medium-gray/10 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {snippet.title ? (
              <h3 className="truncate text-sm font-medium">{snippet.title}</h3>
            ) : (
              <h3 className="truncate text-sm font-medium text-medium-gray">
                Untitled snippet
              </h3>
            )}
            <span
              className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs"
              style={{
                borderColor: LANG_COLORS[snippet.language] || "#666",
                border: "1px solid",
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: LANG_COLORS[snippet.language] || "#666",
                }}
              />
              {snippet.language}
            </span>
          </div>
          {snippet.description && (
            <p className="mt-1 truncate text-xs text-medium-gray">
              {snippet.description}
            </p>
          )}
        </div>
        <div className="ml-3 flex shrink-0 items-center gap-3">
          <button
            onClick={copyCode}
            className="text-xs text-medium-gray transition-colors hover:text-code-green"
            title="Copy code"
          >
            copy
          </button>
          <button
            onClick={onLike}
            className="flex items-center gap-1 text-xs text-medium-gray transition-colors hover:text-code-blue"
          >
            <span>{snippet.like_count}</span>
            <span>likes</span>
          </button>
        </div>
      </div>

      {/* Code preview */}
      <div className="relative">
        <pre className="overflow-x-auto bg-[#0a0a0a] px-4 py-3 font-mono text-xs leading-5 text-light-gray">
          <code>
            {(expanded ? lines : previewLines).map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-4 inline-block w-6 select-none text-right text-medium-gray/40">
                  {i + 1}
                </span>
                <span className="flex-1 whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a] to-transparent py-4 text-center text-xs text-code-green hover:underline"
          >
            Show all {lines.length} lines
          </button>
        )}
        {hasMore && expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="w-full bg-[#0a0a0a] py-2 text-center text-xs text-code-green hover:underline"
          >
            Collapse
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-medium-gray/10 px-4 py-2 text-xs text-medium-gray">
        <span>
          by {snippet.author_name} &middot;{" "}
          {formatTimeAgo(snippet.created_at)}
        </span>
        <span>
          {snippet.fork_count} {snippet.fork_count === 1 ? "fork" : "forks"}
        </span>
      </div>
    </div>
  );
}
