"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Kudos = {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  message: string;
  category: string;
  created_at: string;
};

type KudosWallProps = {
  endeavorId: string;
  members?: { id: string; name: string }[];
};

const categoryIcons: Record<string, string> = {
  "great-work": "★",
  "helpful": "♥",
  "creative": "✦",
  "leadership": "◆",
  "dedication": "▲",
};

export function KudosWall({ endeavorId, members = [] }: KudosWallProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [kudos, setKudos] = useState<Kudos[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("great-work");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/kudos`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setKudos)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function giveKudos() {
    if (!recipientId || !message.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/kudos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId, message: message.trim(), category }),
    });
    if (res.ok) {
      const k = await res.json();
      const recipient = members.find((m) => m.id === recipientId);
      setKudos((prev) => [{
        ...k,
        sender_name: session!.user.name,
        recipient_name: recipient?.name || "Someone",
      }, ...prev]);
      setMessage("");
      setRecipientId("");
      setShowForm(false);
      toast("Kudos sent!", "success");
    }
    setSubmitting(false);
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// kudos"}
        </h3>
        {session && members.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-medium-gray hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "+ Give Kudos"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-medium-gray/20 p-3 mb-3 space-y-2">
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            className="w-full border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white"
          >
            <option value="">Select recipient</option>
            {members
              .filter((m) => m.id !== session?.user?.id)
              .map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
          </select>
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What did they do great?"
              className="flex-1 border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white placeholder:text-medium-gray"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white"
            >
              <option value="great-work">Great Work</option>
              <option value="helpful">Helpful</option>
              <option value="creative">Creative</option>
              <option value="leadership">Leadership</option>
              <option value="dedication">Dedication</option>
            </select>
          </div>
          <button
            onClick={giveKudos}
            disabled={submitting || !recipientId || !message.trim()}
            className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Kudos"}
          </button>
        </div>
      )}

      {kudos.length === 0 ? (
        <p className="text-xs text-medium-gray">No kudos given yet.</p>
      ) : (
        <div className="space-y-2">
          {kudos.slice(0, 10).map((k) => (
            <div key={k.id} className="border border-medium-gray/10 p-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-code-green">{categoryIcons[k.category] || "★"}</span>
                <Link href={`/users/${k.sender_id}`} className="text-code-blue hover:text-code-green">
                  {k.sender_name}
                </Link>
                <span className="text-medium-gray">→</span>
                <Link href={`/users/${k.recipient_id}`} className="text-code-blue hover:text-code-green">
                  {k.recipient_name}
                </Link>
              </div>
              <p className="text-xs text-light-gray/80 mt-1">{k.message}</p>
              <span className="text-xs text-medium-gray">{formatTimeAgo(k.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
