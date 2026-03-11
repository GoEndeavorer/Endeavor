"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Article = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author_name: string;
  view_count: number;
  helpful_count: number;
  created_at: string;
};

const CATEGORIES = ["all", "general", "guides", "tutorials", "faq", "troubleshooting", "best-practices"];

export default function KnowledgeBasePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [artCategory, setArtCategory] = useState("general");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("search", search);
    const qs = params.toString() ? `?${params}` : "";
    fetch(`/api/knowledge-base${qs}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setArticles)
      .finally(() => setLoading(false));
  }, [category, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  async function submitArticle() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetch("/api/knowledge-base", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), category: artCategory, tags }),
    });
    if (res.ok) {
      const article = await res.json();
      setArticles((prev) => [{ ...article, author_name: session!.user.name }, ...prev]);
      setTitle("");
      setContent("");
      setTagsInput("");
      setShowForm(false);
      toast("Article published!", "success");
    } else {
      toast("Failed to publish article", "error");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Knowledge Base", href: "/knowledge-base" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-sm text-medium-gray">Community articles, guides, and answers</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
            >
              {showForm ? "Cancel" : "+ New Article"}
            </button>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold border border-code-blue text-code-blue hover:bg-code-blue hover:text-black transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Filters */}
        <div className="flex gap-1 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2 py-1 text-xs font-semibold transition-colors ${
                category === cat ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Create Article Form */}
        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// new article"}</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Article content..."
              rows={8}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <div className="flex gap-3">
              <select
                value={artCategory}
                onChange={(e) => setArtCategory(e.target.value)}
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
              >
                {CATEGORIES.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags (comma separated)"
                className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
            </div>
            <button
              onClick={submitArticle}
              disabled={submitting || !title.trim() || !content.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        )}

        {/* Articles List */}
        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : articles.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No articles found. Be the first to share knowledge!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => {
              const excerpt =
                article.content.length > 150
                  ? article.content.slice(0, 147) + "..."
                  : article.content;
              return (
                <div
                  key={article.id}
                  className="block border border-medium-gray/20 p-4 hover:border-code-green/30 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2 text-xs text-medium-gray">
                    <span className="px-1.5 py-0.5 border border-code-blue/30 text-code-blue text-[10px] font-semibold uppercase">
                      {article.category}
                    </span>
                    {article.tags?.length > 0 &&
                      article.tags.map((tag) => (
                        <span key={tag} className="text-medium-gray/60">
                          #{tag}
                        </span>
                      ))}
                  </div>
                  <h3 className="text-sm font-semibold text-light-gray group-hover:text-code-green transition-colors mb-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-medium-gray line-clamp-2 mb-2 leading-relaxed">{excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-medium-gray">
                    <span className="text-code-blue">{article.author_name}</span>
                    <span>{formatTimeAgo(article.created_at)}</span>
                    <span>{article.view_count} views</span>
                    <span className="text-code-green">{article.helpful_count} helpful</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
