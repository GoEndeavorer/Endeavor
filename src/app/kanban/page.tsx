"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type Card = {
  id: string;
  title: string;
  description: string | null;
  column_name: string;
  priority: string;
  assignee_name: string | null;
  creator_name: string;
  created_at: string;
};

const COLUMNS = [
  { key: "backlog", label: "Backlog", color: "text-medium-gray" },
  { key: "todo", label: "To Do", color: "text-code-blue" },
  { key: "in-progress", label: "In Progress", color: "text-yellow-400" },
  { key: "review", label: "Review", color: "text-purple-400" },
  { key: "done", label: "Done", color: "text-code-green" },
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

const priorityColors: Record<string, string> = {
  low: "border-medium-gray/30",
  medium: "border-code-blue/30",
  high: "border-yellow-400/30",
  urgent: "border-red-400/30",
};

const priorityDots: Record<string, string> = {
  low: "bg-medium-gray",
  medium: "bg-code-blue",
  high: "bg-yellow-400",
  urgent: "bg-red-400",
};

export default function KanbanPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [column, setColumn] = useState("backlog");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [dragCard, setDragCard] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kanban")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCards)
      .finally(() => setLoading(false));
  }, []);

  async function createCard() {
    if (!title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description || undefined, column, priority }),
    });
    if (res.ok) {
      const card = await res.json();
      setCards((prev) => [...prev, { ...card, creator_name: session!.user.name, assignee_name: null }]);
      setTitle("");
      setDescription("");
      setColumn("backlog");
      setPriority("medium");
      setShowForm(false);
      toast("Card created!", "success");
    }
    setSubmitting(false);
  }

  async function moveCard(cardId: string, newColumn: string) {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, column_name: newColumn } : c)));
    await fetch("/api/kanban", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cardId, column: newColumn }),
    });
  }

  function handleDragStart(cardId: string) {
    setDragCard(cardId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(columnKey: string) {
    if (dragCard) {
      moveCard(dragCard, columnKey);
      setDragCard(null);
    }
  }

  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.key] = cards.filter((c) => c.column_name === col.key);
      return acc;
    },
    {} as Record<string, Card[]>
  );

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Kanban", href: "/kanban" }} />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Kanban Board</h1>
            <p className="text-sm text-medium-gray">Drag cards between columns to update status</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
            >
              {showForm ? "Cancel" : "+ New Card"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// new card"}</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <div className="flex gap-3">
              <select value={column} onChange={(e) => setColumn(e.target.value)} className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white">
                {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <button
              onClick={createCard}
              disabled={submitting || !title.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Card"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading board...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                className="border border-medium-gray/20 p-3 min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.key)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xs font-semibold uppercase tracking-widest ${col.color}`}>
                    {col.label}
                  </h3>
                  <span className="text-xs text-medium-gray">{grouped[col.key]?.length || 0}</span>
                </div>
                <div className="space-y-2">
                  {(grouped[col.key] || []).map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      className={`border ${priorityColors[card.priority] || "border-medium-gray/20"} p-3 cursor-grab active:cursor-grabbing hover:border-code-green/40 transition-colors bg-black/50`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityDots[card.priority] || "bg-medium-gray"}`} />
                        <span className="text-xs text-medium-gray capitalize">{card.priority}</span>
                      </div>
                      <p className="text-sm font-medium text-light-gray">{card.title}</p>
                      {card.description && (
                        <p className="text-xs text-medium-gray mt-1 line-clamp-2">{card.description}</p>
                      )}
                      {card.assignee_name && (
                        <p className="text-xs text-code-blue mt-2">{card.assignee_name}</p>
                      )}
                    </div>
                  ))}
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
