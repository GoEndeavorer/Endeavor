"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Question = {
  id: string;
  title: string;
  body: string | null;
  tags: string[];
  answer_count: number;
  vote_count: number;
  solved: boolean;
  created_at: string;
  author_name: string;
  author_image: string | null;
};

export default function QuestionsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, []);

  async function askQuestion() {
    if (!title.trim()) return;
    setSubmitting(true);
    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), body: body || undefined, tags }),
    });
    if (res.ok) {
      const q = await res.json();
      setQuestions((prev) => [{ ...q, author_name: session!.user.name, author_image: null }, ...prev]);
      setTitle("");
      setBody("");
      setTagInput("");
      setShowForm(false);
      toast("Question posted!", "success");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Q&A", href: "/questions" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Questions & Answers</h1>
            <p className="text-sm text-medium-gray">Ask questions, share knowledge, help others</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
            >
              {showForm ? "Cancel" : "Ask Question"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// ask a question"}
            </h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add more details (optional, Markdown supported)"
              rows={4}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Tags (comma-separated, e.g., react, design, planning)"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <button
              onClick={askQuestion}
              disabled={submitting || !title.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Question"}
            </button>
          </div>
        )}

        {!session && (
          <div className="mb-6 border border-medium-gray/20 p-4 text-center">
            <p className="text-sm text-medium-gray">
              <Link href="/login" className="text-code-blue hover:text-code-green">Log in</Link> to ask and answer questions.
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : questions.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className="flex gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30 group"
              >
                {/* Stats */}
                <div className="shrink-0 flex flex-col items-center gap-1 w-16">
                  <div className="text-center">
                    <p className="text-sm font-bold text-code-green">{q.vote_count}</p>
                    <p className="text-xs text-medium-gray">votes</p>
                  </div>
                  <div className={`text-center ${q.answer_count > 0 ? (q.solved ? "text-code-green" : "text-code-blue") : ""}`}>
                    <p className="text-sm font-bold">{q.answer_count}</p>
                    <p className="text-xs text-medium-gray">answers</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {q.solved && (
                      <span className="text-xs px-1.5 py-0.5 border border-code-green/30 text-code-green">Solved</span>
                    )}
                    <h3 className="text-sm font-semibold text-light-gray group-hover:text-code-green transition-colors truncate">
                      {q.title}
                    </h3>
                  </div>
                  {q.body && (
                    <p className="text-xs text-medium-gray line-clamp-2 mb-2">{q.body}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {q.tags?.map((tag) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 border border-code-blue/20 text-code-blue">
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs text-medium-gray">
                      {q.author_name} · {formatTimeAgo(q.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
