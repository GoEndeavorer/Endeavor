"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  author_id: string;
  author_name: string;
  author_image: string | null;
  accepted_answer_id: string | null;
  created_at: string;
};

type Answer = {
  id: string;
  body: string;
  vote_count: number;
  accepted: boolean;
  author_id: string;
  author_name: string;
  author_image: string | null;
  created_at: string;
};

export default function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/questions/${questionId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/questions/${questionId}/answers`).then((r) => (r.ok ? r.json() : [])),
    ]).then(([q, a]) => {
      setQuestion(q);
      setAnswers(a);
      setLoading(false);
    });
  }, [questionId]);

  async function submitAnswer() {
    if (!answerBody.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/questions/${questionId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: answerBody.trim() }),
    });
    if (res.ok) {
      const a = await res.json();
      setAnswers((prev) => [
        ...prev,
        { ...a, author_name: session!.user.name, author_image: null },
      ]);
      setAnswerBody("");
      setQuestion((q) => q ? { ...q, answer_count: q.answer_count + 1 } : q);
      toast("Answer posted!", "success");
    }
    setSubmitting(false);
  }

  async function vote(type: "question" | "answer", id: string, direction: "up" | "down") {
    if (!session) return;
    setVoting(id);
    const res = await fetch(`/api/questions/${questionId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: type, targetId: id, direction }),
    });
    if (res.ok) {
      const { vote_count } = await res.json();
      if (type === "question") {
        setQuestion((q) => q ? { ...q, vote_count } : q);
      } else {
        setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, vote_count } : a)));
      }
    }
    setVoting(null);
  }

  async function acceptAnswer(answerId: string) {
    const res = await fetch(`/api/questions/${questionId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId }),
    });
    if (res.ok) {
      setAnswers((prev) =>
        prev.map((a) => ({ ...a, accepted: a.id === answerId }))
      );
      setQuestion((q) => q ? { ...q, solved: true, accepted_answer_id: answerId } : q);
      toast("Answer accepted!", "success");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Q&A", href: "/questions" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Q&A", href: "/questions" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Question not found.</p>
          <Link href="/questions" className="text-xs text-code-blue hover:text-code-green mt-2 inline-block">
            Back to Q&A
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isAuthor = session?.user.id === question.author_id;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Q&A", href: "/questions" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Question */}
        <div className="flex gap-4 mb-8">
          {/* Voting */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <button
              onClick={() => vote("question", question.id, "up")}
              disabled={!session || voting === question.id}
              className="text-medium-gray hover:text-code-green disabled:opacity-30 transition-colors"
              aria-label="Upvote"
            >
              ▲
            </button>
            <span className="text-sm font-bold text-code-green">{question.vote_count}</span>
            <button
              onClick={() => vote("question", question.id, "down")}
              disabled={!session || voting === question.id}
              className="text-medium-gray hover:text-red-400 disabled:opacity-30 transition-colors"
              aria-label="Downvote"
            >
              ▼
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {question.solved && (
                <span className="text-xs px-1.5 py-0.5 border border-code-green/30 text-code-green">
                  Solved
                </span>
              )}
              <h1 className="text-xl font-bold text-light-gray">{question.title}</h1>
            </div>

            {question.body && (
              <div className="text-sm text-light-gray/80 whitespace-pre-wrap mb-3">
                {question.body}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {question.tags?.map((tag) => (
                <Link
                  key={tag}
                  href={`/questions?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-1.5 py-0.5 border border-code-blue/20 text-code-blue hover:border-code-blue/40"
                >
                  {tag}
                </Link>
              ))}
              <span className="text-xs text-medium-gray">
                Asked by{" "}
                <Link href={`/users/${question.author_id}`} className="text-code-blue hover:text-code-green">
                  {question.author_name}
                </Link>{" "}
                · {formatTimeAgo(question.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="border-t border-medium-gray/20 pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-4">
            {"// "}{answers.length} {answers.length === 1 ? "answer" : "answers"}
          </h2>

          {answers.length === 0 ? (
            <p className="text-sm text-medium-gray mb-6">No answers yet. Be the first to help!</p>
          ) : (
            <div className="space-y-4 mb-6">
              {answers.map((a) => (
                <div
                  key={a.id}
                  className={`flex gap-4 border p-4 ${
                    a.accepted
                      ? "border-code-green/40 bg-code-green/5"
                      : "border-medium-gray/20"
                  }`}
                >
                  {/* Voting */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <button
                      onClick={() => vote("answer", a.id, "up")}
                      disabled={!session || voting === a.id}
                      className="text-medium-gray hover:text-code-green disabled:opacity-30 transition-colors text-xs"
                      aria-label="Upvote answer"
                    >
                      ▲
                    </button>
                    <span className="text-xs font-bold text-code-green">{a.vote_count}</span>
                    <button
                      onClick={() => vote("answer", a.id, "down")}
                      disabled={!session || voting === a.id}
                      className="text-medium-gray hover:text-red-400 disabled:opacity-30 transition-colors text-xs"
                      aria-label="Downvote answer"
                    >
                      ▼
                    </button>
                    {a.accepted && (
                      <span className="text-code-green text-lg mt-1" title="Accepted answer">✓</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-light-gray/80 whitespace-pre-wrap mb-2">
                      {a.body}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-medium-gray">
                        <Link href={`/users/${a.author_id}`} className="text-code-blue hover:text-code-green">
                          {a.author_name}
                        </Link>{" "}
                        · {formatTimeAgo(a.created_at)}
                      </span>
                      {isAuthor && !question.solved && !a.accepted && (
                        <button
                          onClick={() => acceptAnswer(a.id)}
                          className="text-xs text-medium-gray hover:text-code-green transition-colors"
                        >
                          Accept answer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Answer form */}
        {session ? (
          <div className="border border-medium-gray/20 p-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// your answer"}
            </h2>
            <textarea
              value={answerBody}
              onChange={(e) => setAnswerBody(e.target.value)}
              placeholder="Write your answer (Markdown supported)"
              rows={5}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <button
              onClick={submitAnswer}
              disabled={submitting || !answerBody.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Answer"}
            </button>
          </div>
        ) : (
          <div className="border border-medium-gray/20 p-4 text-center">
            <p className="text-sm text-medium-gray">
              <Link href="/login" className="text-code-blue hover:text-code-green">Log in</Link> to answer this question.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
