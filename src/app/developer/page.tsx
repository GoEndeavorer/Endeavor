"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  key?: string;
  scopes: string[];
  last_used: string | null;
  expires_at: string | null;
  created_at: string;
};

type Webhook = {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  last_triggered: string | null;
  failure_count: number;
  created_at: string;
};

const WEBHOOK_EVENTS = [
  "endeavor.created", "endeavor.updated", "endeavor.completed",
  "member.joined", "member.left",
  "task.created", "task.completed",
  "milestone.reached",
  "story.published",
  "discussion.posted",
];

export default function DeveloperPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [tab, setTab] = useState<"keys" | "webhooks">("keys");

  // API Keys state
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyScopes, setKeyScopes] = useState<string[]>(["read"]);
  const [keyExpiry, setKeyExpiry] = useState("never");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keySubmitting, setKeySubmitting] = useState(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(true);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookSubmitting, setWebhookSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/api-keys")
      .then((r) => (r.ok ? r.json() : []))
      .then(setKeys)
      .finally(() => setKeysLoading(false));
    fetch("/api/webhooks")
      .then((r) => (r.ok ? r.json() : []))
      .then(setWebhooks)
      .finally(() => setWebhooksLoading(false));
  }, []);

  async function createKey() {
    if (!keyName.trim()) return;
    setKeySubmitting(true);
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: keyName.trim(), scopes: keyScopes, expiresIn: keyExpiry === "never" ? undefined : keyExpiry }),
    });
    if (res.ok) {
      const data = await res.json();
      setNewKey(data.key);
      setKeys((prev) => [data, ...prev]);
      setKeyName("");
      setShowKeyForm(false);
      toast("API key created!", "success");
    }
    setKeySubmitting(false);
  }

  async function deleteKey(id: string) {
    await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast("Key revoked", "success");
  }

  async function createWebhook() {
    if (!webhookUrl.trim() || webhookEvents.length === 0) return;
    setWebhookSubmitting(true);
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl.trim(), events: webhookEvents, secret: webhookSecret || undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      setWebhooks((prev) => [data, ...prev]);
      setWebhookUrl("");
      setWebhookEvents([]);
      setWebhookSecret("");
      setShowWebhookForm(false);
      toast("Webhook created!", "success");
    }
    setWebhookSubmitting(false);
  }

  async function deleteWebhook(id: string) {
    await fetch(`/api/webhooks?id=${id}`, { method: "DELETE" });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast("Webhook deleted", "success");
  }

  function toggleScope(scope: string) {
    setKeyScopes((prev) => prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]);
  }

  function toggleEvent(event: string) {
    setWebhookEvents((prev) => prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]);
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Developer", href: "/developer" }} />
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
          <p className="text-sm text-medium-gray">Sign in to access developer settings</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Developer", href: "/developer" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-1">Developer Settings</h1>
        <p className="text-sm text-medium-gray mb-6">Manage API keys and webhooks</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("keys")}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${
              tab === "keys" ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setTab("webhooks")}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${
              tab === "webhooks" ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
            }`}
          >
            Webhooks
          </button>
        </div>

        {/* New Key Alert */}
        {newKey && (
          <div className="border border-code-green/50 bg-code-green/5 p-4 mb-6">
            <p className="text-xs text-code-green mb-2 font-semibold">Your new API key (copy it now — it won&apos;t be shown again):</p>
            <code className="block text-sm text-code-green bg-black p-2 border border-code-green/30 break-all">{newKey}</code>
            <button onClick={() => setNewKey(null)} className="mt-2 text-xs text-medium-gray hover:text-light-gray">Dismiss</button>
          </div>
        )}

        {tab === "keys" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// api keys"}</h2>
              <button
                onClick={() => setShowKeyForm(!showKeyForm)}
                className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
              >
                {showKeyForm ? "Cancel" : "+ New Key"}
              </button>
            </div>

            {showKeyForm && (
              <div className="border border-medium-gray/20 p-4 mb-4 space-y-3">
                <input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="Key name (e.g. Production, Testing)"
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                />
                <div>
                  <p className="text-xs text-medium-gray mb-1">Scopes</p>
                  <div className="flex gap-2">
                    {["read", "write", "admin"].map((scope) => (
                      <button
                        key={scope}
                        onClick={() => toggleScope(scope)}
                        className={`px-3 py-1 text-xs border transition-colors ${
                          keyScopes.includes(scope) ? "border-code-green text-code-green" : "border-medium-gray/30 text-medium-gray"
                        }`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-medium-gray mb-1">Expiry</p>
                  <select value={keyExpiry} onChange={(e) => setKeyExpiry(e.target.value)} className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white">
                    <option value="never">Never</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                    <option value="1y">1 year</option>
                  </select>
                </div>
                <button
                  onClick={createKey}
                  disabled={keySubmitting || !keyName.trim()}
                  className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
                >
                  {keySubmitting ? "Creating..." : "Create Key"}
                </button>
              </div>
            )}

            {keysLoading ? (
              <p className="text-sm text-medium-gray">Loading...</p>
            ) : keys.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center">
                <p className="text-sm text-medium-gray">No API keys yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {keys.map((key) => (
                  <div key={key.id} className="border border-medium-gray/20 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-light-gray">{key.name}</p>
                      <div className="flex items-center gap-3 text-xs text-medium-gray mt-1">
                        <code>{key.key_prefix}...</code>
                        <span>{key.scopes.join(", ")}</span>
                        {key.last_used && <span>Used {formatTimeAgo(key.last_used)}</span>}
                        {key.expires_at && <span>Expires {new Date(key.expires_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteKey(key.id)} className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "webhooks" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// webhooks"}</h2>
              <button
                onClick={() => setShowWebhookForm(!showWebhookForm)}
                className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
              >
                {showWebhookForm ? "Cancel" : "+ New Webhook"}
              </button>
            </div>

            {showWebhookForm && (
              <div className="border border-medium-gray/20 p-4 mb-4 space-y-3">
                <input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="Payload URL (https://...)"
                  type="url"
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                />
                <input
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Secret (optional)"
                  type="password"
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                />
                <div>
                  <p className="text-xs text-medium-gray mb-2">Events</p>
                  <div className="flex flex-wrap gap-2">
                    {WEBHOOK_EVENTS.map((event) => (
                      <button
                        key={event}
                        onClick={() => toggleEvent(event)}
                        className={`px-2 py-1 text-xs border transition-colors ${
                          webhookEvents.includes(event) ? "border-code-green text-code-green" : "border-medium-gray/30 text-medium-gray"
                        }`}
                      >
                        {event}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={createWebhook}
                  disabled={webhookSubmitting || !webhookUrl.trim() || webhookEvents.length === 0}
                  className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
                >
                  {webhookSubmitting ? "Creating..." : "Create Webhook"}
                </button>
              </div>
            )}

            {webhooksLoading ? (
              <p className="text-sm text-medium-gray">Loading...</p>
            ) : webhooks.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center">
                <p className="text-sm text-medium-gray">No webhooks configured</p>
              </div>
            ) : (
              <div className="space-y-2">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="border border-medium-gray/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm text-code-blue">{wh.url}</code>
                      <button onClick={() => deleteWebhook(wh.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {wh.events.map((ev) => (
                        <span key={ev} className="px-1.5 py-0.5 text-xs border border-medium-gray/20 text-medium-gray">{ev}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-medium-gray">
                      <span className={wh.enabled ? "text-code-green" : "text-red-400"}>{wh.enabled ? "Active" : "Disabled"}</span>
                      {wh.last_triggered && <span>Last triggered {formatTimeAgo(wh.last_triggered)}</span>}
                      {wh.failure_count > 0 && <span className="text-red-400">{wh.failure_count} failures</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
