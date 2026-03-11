"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export default function ContactPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("feedback");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session?.user.name || name,
          email: session?.user.email || email,
          type,
          message,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Silent fail
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Contact", href: "/contact" }} />

      <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Get in Touch</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Bug reports, feature requests, partnership inquiries, or just to say hello.
        </p>

        {submitted ? (
          <div className="border border-code-green/30 bg-code-green/5 p-8 text-center">
            <p className="text-lg font-semibold text-code-green mb-2">Message sent!</p>
            <p className="text-sm text-medium-gray">
              Thanks for reaching out. We&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!session && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-light-gray">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-light-gray">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                    placeholder="your@email.com"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm text-light-gray">Type</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "feedback", label: "Feedback" },
                  { id: "bug", label: "Bug Report" },
                  { id: "feature", label: "Feature Request" },
                  { id: "partnership", label: "Partnership" },
                  { id: "other", label: "Other" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                      type === t.id
                        ? "border-code-green bg-code-green text-black"
                        : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-light-gray">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="w-full border border-code-green bg-code-green px-4 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
