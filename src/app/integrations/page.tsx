"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type Integration = {
  id: string;
  provider: string;
  provider_user_id: string | null;
  enabled: boolean;
  config: Record<string, unknown>;
  connected_at: string;
};

type AvailableIntegration = {
  provider: string;
  name: string;
  description: string;
  icon: string;
  category: string;
};

const available: AvailableIntegration[] = [
  { provider: "github", name: "GitHub", description: "Link repos, sync issues, show contributions", icon: "GH", category: "Development" },
  { provider: "gitlab", name: "GitLab", description: "Connect GitLab projects and merge requests", icon: "GL", category: "Development" },
  { provider: "figma", name: "Figma", description: "Embed designs and prototypes", icon: "FG", category: "Design" },
  { provider: "notion", name: "Notion", description: "Sync docs and databases", icon: "NO", category: "Productivity" },
  { provider: "slack", name: "Slack", description: "Get notifications in your Slack workspace", icon: "SL", category: "Communication" },
  { provider: "discord", name: "Discord", description: "Post updates to Discord channels", icon: "DC", category: "Communication" },
  { provider: "trello", name: "Trello", description: "Import boards and sync cards", icon: "TR", category: "Productivity" },
  { provider: "linear", name: "Linear", description: "Sync issues and project tracking", icon: "LN", category: "Development" },
  { provider: "calendar", name: "Google Calendar", description: "Sync events and deadlines", icon: "GC", category: "Productivity" },
  { provider: "zapier", name: "Zapier", description: "Automate workflows with 5000+ apps", icon: "ZP", category: "Automation" },
];

export default function IntegrationsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [connected, setConnected] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/integrations")
      .then((r) => (r.ok ? r.json() : []))
      .then(setConnected)
      .finally(() => setLoading(false));
  }, [session]);

  const connectedProviders = new Set(connected.map((c) => c.provider));

  async function connect(provider: string) {
    setConnecting(provider);
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    if (res.ok) {
      const int = await res.json();
      setConnected((prev) => [...prev.filter((c) => c.provider !== provider), int]);
      toast(`${provider} connected!`, "success");
    }
    setConnecting(null);
  }

  async function disconnect(provider: string) {
    const res = await fetch(`/api/integrations?provider=${provider}`, { method: "DELETE" });
    if (res.ok) {
      setConnected((prev) => prev.filter((c) => c.provider !== provider));
      toast(`${provider} disconnected`, "success");
    }
  }

  const categories = [...new Set(available.map((a) => a.category))];

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Integrations", href: "/integrations" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Please log in to manage integrations.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Integrations", href: "/integrations" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-medium-gray">Connect your favorite tools and services</p>
        </div>

        {/* Connected */}
        {connected.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
              {"// connected"}
            </h2>
            <div className="space-y-2">
              {connected.map((int) => {
                const info = available.find((a) => a.provider === int.provider);
                return (
                  <div key={int.id} className="flex items-center justify-between border border-code-green/20 p-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-code-green/10 text-code-green border border-code-green/20">
                        {info?.icon || int.provider.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-light-gray">{info?.name || int.provider}</p>
                        <p className="text-xs text-code-green">Connected</p>
                      </div>
                    </div>
                    <button
                      onClick={() => disconnect(int.provider)}
                      className="text-xs text-medium-gray hover:text-red-400 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available by category */}
        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : (
          categories.map((cat) => (
            <div key={cat} className="mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-medium-gray mb-3">
                {cat}
              </h2>
              <div className="space-y-2">
                {available
                  .filter((a) => a.category === cat && !connectedProviders.has(a.provider))
                  .map((a) => (
                    <div key={a.provider} className="flex items-center justify-between border border-medium-gray/20 p-3 hover:border-medium-gray/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-medium-gray/10 text-medium-gray border border-medium-gray/20">
                          {a.icon}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-light-gray">{a.name}</p>
                          <p className="text-xs text-medium-gray">{a.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => connect(a.provider)}
                        disabled={connecting === a.provider}
                        className="px-3 py-1 text-xs font-semibold border border-code-blue/50 text-code-blue hover:bg-code-blue hover:text-black transition-colors disabled:opacity-50"
                      >
                        {connecting === a.provider ? "..." : "Connect"}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </main>
      <Footer />
    </div>
  );
}
