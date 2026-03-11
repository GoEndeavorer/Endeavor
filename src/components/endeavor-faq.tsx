"use client";

import { useState, useEffect } from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type EndeavorFaqProps = {
  endeavorId: string;
  isCreator: boolean;
};

export function EndeavorFaq({ endeavorId, isCreator }: EndeavorFaqProps) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/faq`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });
      if (res.ok) {
        const item = await res.json();
        setItems((prev) => [...prev, item]);
        setNewQuestion("");
        setNewAnswer("");
        setShowForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteItem(faqId: string) {
    await fetch(`/api/endeavors/${endeavorId}/faq`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faqId }),
    });
    setItems((prev) => prev.filter((i) => i.id !== faqId));
  }

  if (loading) return null;
  if (items.length === 0 && !isCreator) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-code-blue">
          {"// FAQ"}
        </h2>
        {isCreator && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-code-blue hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "+ Add"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={addItem} className="mb-4 space-y-2 border border-medium-gray/20 p-3">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Question..."
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
            maxLength={200}
          />
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Answer..."
            rows={3}
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-light-gray outline-none focus:border-code-green resize-none"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newQuestion.trim() || !newAnswer.trim() || submitting}
            className="border border-code-green px-4 py-1.5 text-xs font-bold text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add FAQ"}
          </button>
        </form>
      )}

      {items.length === 0 ? (
        isCreator && (
          <p className="text-xs text-medium-gray">
            No FAQ items yet. Add common questions to help potential members.
          </p>
        )
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="border border-medium-gray/20">
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-light-gray">
                  {item.question}
                </span>
                <span className="ml-2 text-xs text-medium-gray shrink-0">
                  {openId === item.id ? "−" : "+"}
                </span>
              </button>
              {openId === item.id && (
                <div className="border-t border-medium-gray/10 px-4 py-3">
                  <p className="text-sm text-medium-gray leading-relaxed">
                    {item.answer}
                  </p>
                  {isCreator && (
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="mt-2 text-xs text-red-400/70 hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
