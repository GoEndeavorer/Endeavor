"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

type FAQSectionProps = {
  endeavorId: string;
  canEdit?: boolean;
};

export function FAQSection({ endeavorId, canEdit = false }: FAQSectionProps) {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/faq`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFaqs)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function addFAQ() {
    if (!question.trim() || !answer.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/faq`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.trim(), answer: answer.trim() }),
    });
    if (res.ok) {
      const faq = await res.json();
      setFaqs((prev) => [...prev, faq]);
      setQuestion("");
      setAnswer("");
      setShowForm(false);
      toast("FAQ added!", "success");
    }
    setSubmitting(false);
  }

  async function deleteFAQ(faqId: string) {
    const res = await fetch(`/api/endeavors/${endeavorId}/faq?faqId=${faqId}`, { method: "DELETE" });
    if (res.ok) {
      setFaqs((prev) => prev.filter((f) => f.id !== faqId));
    }
  }

  if (loading) return null;
  if (faqs.length === 0 && !canEdit) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// faq"}
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-medium-gray hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "+ Add"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-medium-gray/20 p-3 mb-3 space-y-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer"
            rows={3}
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray resize-y"
          />
          <button
            onClick={addFAQ}
            disabled={submitting || !question.trim() || !answer.trim()}
            className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add FAQ"}
          </button>
        </div>
      )}

      <div className="space-y-1">
        {faqs.map((faq) => (
          <div key={faq.id} className="border border-medium-gray/20">
            <button
              onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-medium-gray/5 transition-colors"
            >
              <span className="text-sm text-light-gray">{faq.question}</span>
              <span className="text-xs text-medium-gray shrink-0 ml-2">
                {expanded === faq.id ? "−" : "+"}
              </span>
            </button>
            {expanded === faq.id && (
              <div className="px-3 pb-3 border-t border-medium-gray/10">
                <p className="text-sm text-light-gray/80 mt-2 whitespace-pre-wrap">{faq.answer}</p>
                {canEdit && (
                  <button
                    onClick={() => deleteFAQ(faq.id)}
                    className="text-xs text-medium-gray hover:text-red-400 mt-2 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
