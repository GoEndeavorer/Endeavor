"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

export function InviteEmailForm({ endeavorId }: { endeavorId: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast("Please enter an email address", "error");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/invite-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          message: message.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast("Invitation sent successfully", "success");
        setEmail("");
        setMessage("");
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "Failed to send invitation", "error");
      }
    } catch {
      toast("Network error -- please try again", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border border-medium-gray/30 p-4">
      <h3 className="mb-3 text-sm font-medium text-code-green">
        Invite by Email
      </h3>

      <label className="mb-1 block text-xs text-medium-gray">
        Email address
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="colleague@example.com"
        className="mb-3 w-full border border-medium-gray/40 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray/60 outline-none focus:border-code-blue"
      />

      <label className="mb-1 block text-xs text-medium-gray">
        Personal message (optional)
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Hey, I think you'd be a great fit for this project..."
        rows={3}
        className="mb-3 w-full resize-none border border-medium-gray/40 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray/60 outline-none focus:border-code-blue"
      />

      <button
        onClick={handleSend}
        disabled={sending || !email.trim()}
        className="border border-code-green/60 px-4 py-2 text-xs font-medium text-code-green transition-colors hover:bg-code-green/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {sending ? "Sending..." : "Send Invite"}
      </button>
    </div>
  );
}
