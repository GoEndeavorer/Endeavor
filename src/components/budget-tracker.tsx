"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type BudgetItem = {
  id: string;
  category: string;
  description: string;
  amount: string;
  type: string;
  status: string;
  created_by_name: string;
  created_at: string;
};

type BudgetSummary = {
  total_income: string;
  total_expenses: string;
  balance: string;
};

type BudgetTrackerProps = {
  endeavorId: string;
  canEdit?: boolean;
};

export function BudgetTracker({ endeavorId, canEdit = false }: BudgetTrackerProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/budget`)
      .then((r) => (r.ok ? r.json() : { items: [], summary: null }))
      .then((data) => {
        setItems(data.items);
        setSummary(data.summary);
      })
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function addItem() {
    if (!desc.trim() || !amount) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc.trim(), amount: Number(amount), type, category }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      setDesc("");
      setAmount("");
      setShowForm(false);
      toast("Budget item added!", "success");
      // Refetch summary
      fetch(`/api/endeavors/${endeavorId}/budget`)
        .then((r) => r.json())
        .then((data) => setSummary(data.summary));
    }
    setSubmitting(false);
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// budget"}
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

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="border border-code-green/20 p-2 text-center">
            <p className="text-sm font-bold text-code-green">${Number(summary.total_income).toLocaleString()}</p>
            <p className="text-xs text-medium-gray">Income</p>
          </div>
          <div className="border border-red-400/20 p-2 text-center">
            <p className="text-sm font-bold text-red-400">${Number(summary.total_expenses).toLocaleString()}</p>
            <p className="text-xs text-medium-gray">Expenses</p>
          </div>
          <div className="border border-medium-gray/20 p-2 text-center">
            <p className={`text-sm font-bold ${Number(summary.balance) >= 0 ? "text-code-green" : "text-red-400"}`}>
              ${Number(summary.balance).toLocaleString()}
            </p>
            <p className="text-xs text-medium-gray">Balance</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="border border-medium-gray/20 p-3 mb-3 space-y-2">
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            className="w-full border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              type="number"
              step="0.01"
              className="border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white placeholder:text-medium-gray"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white"
            >
              <option value="general">General</option>
              <option value="hosting">Hosting</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="tools">Tools</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            onClick={addItem}
            disabled={submitting || !desc.trim() || !amount}
            className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-1">
          {items.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-medium-gray/10">
              <div className="flex items-center gap-2">
                <span className={item.type === "income" ? "text-code-green" : "text-red-400"}>
                  {item.type === "income" ? "+" : "−"}${Number(item.amount).toLocaleString()}
                </span>
                <span className="text-light-gray">{item.description}</span>
              </div>
              <span className="text-medium-gray">{formatTimeAgo(item.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
