"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Endpoint = {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  params?: string[];
  body?: string;
  response?: string;
};

const ENDPOINTS: { section: string; endpoints: Endpoint[] }[] = [
  {
    section: "Public",
    endpoints: [
      { method: "GET", path: "/api/v1/stats", description: "Platform statistics", auth: false, response: "{ platform, version, stats, generated_at }" },
      { method: "GET", path: "/api/endeavors", description: "List endeavors with filters", auth: false, params: ["category", "search", "sort", "limit", "offset", "locationType"] },
      { method: "GET", path: "/api/endeavors/trending", description: "Trending endeavors", auth: false },
      { method: "GET", path: "/api/endeavors/most-active", description: "Most active endeavors this week", auth: false },
      { method: "GET", path: "/api/search?q=", description: "Search endeavors, users, stories", auth: false, params: ["q"] },
      { method: "GET", path: "/api/search/suggestions?q=", description: "Search autocomplete suggestions", auth: false, params: ["q"] },
      { method: "GET", path: "/api/tags", description: "Popular tags/skills", auth: false },
      { method: "GET", path: "/api/users/{userId}", description: "Public user profile", auth: false },
      { method: "GET", path: "/api/categories", description: "List all categories with counts", auth: false },
      { method: "GET", path: "/api/endeavors/{id}/embed", description: "Embeddable endeavor data (CORS enabled)", auth: false },
      { method: "GET", path: "/api/health", description: "API health check", auth: false },
    ],
  },
  {
    section: "Endeavors",
    endpoints: [
      { method: "POST", path: "/api/endeavors", description: "Create new endeavor", auth: true, body: "{ title, description, category, ... }" },
      { method: "GET", path: "/api/endeavors/{id}", description: "Get endeavor details", auth: false },
      { method: "PATCH", path: "/api/endeavors/{id}", description: "Update endeavor", auth: true },
      { method: "DELETE", path: "/api/endeavors/{id}", description: "Delete endeavor", auth: true },
      { method: "POST", path: "/api/endeavors/{id}/join", description: "Request to join", auth: true },
      { method: "POST", path: "/api/endeavors/{id}/clone", description: "Clone/fork an endeavor", auth: true },
      { method: "GET", path: "/api/endeavors/{id}/analytics", description: "Creator analytics dashboard", auth: true },
      { method: "GET", path: "/api/endeavors/compare?ids=", description: "Compare up to 4 endeavors", auth: false, params: ["ids"] },
    ],
  },
  {
    section: "Tasks & Milestones",
    endpoints: [
      { method: "GET", path: "/api/endeavors/{id}/tasks", description: "List tasks", auth: true },
      { method: "POST", path: "/api/endeavors/{id}/tasks", description: "Create task", auth: true },
      { method: "PATCH", path: "/api/tasks/{taskId}", description: "Update task status/details", auth: true },
      { method: "GET", path: "/api/endeavors/{id}/milestones", description: "List milestones", auth: true },
      { method: "POST", path: "/api/endeavors/{id}/milestones", description: "Create milestone", auth: true },
      { method: "GET", path: "/api/endeavors/{id}/task-dependencies", description: "Task dependency graph", auth: true },
    ],
  },
  {
    section: "Discussions",
    endpoints: [
      { method: "GET", path: "/api/endeavors/{id}/discussions", description: "List discussions", auth: true },
      { method: "POST", path: "/api/endeavors/{id}/discussions", description: "Post message", auth: true, body: "{ content, parentId? }" },
      { method: "PATCH", path: "/api/discussions/{id}", description: "Edit message or toggle pin", auth: true },
      { method: "DELETE", path: "/api/discussions/{id}", description: "Delete message", auth: true },
      { method: "POST", path: "/api/discussions/{id}/reactions", description: "Add/remove reaction", auth: true, body: "{ emoji }" },
    ],
  },
  {
    section: "Social",
    endpoints: [
      { method: "POST", path: "/api/follow", description: "Follow/unfollow user", auth: true, body: "{ userId }" },
      { method: "GET", path: "/api/follow?userId=", description: "Get follow status", auth: false },
      { method: "GET", path: "/api/messages/conversations", description: "List DM conversations", auth: true },
      { method: "POST", path: "/api/messages", description: "Send direct message", auth: true },
      { method: "POST", path: "/api/endorsements", description: "Endorse an endeavor", auth: true },
    ],
  },
  {
    section: "User",
    endpoints: [
      { method: "GET", path: "/api/achievements", description: "Get user achievements", auth: true },
      { method: "POST", path: "/api/achievements", description: "Check & award achievements", auth: true },
      { method: "GET", path: "/api/profile/pinned", description: "Get pinned endeavors", auth: false, params: ["userId"] },
      { method: "POST", path: "/api/profile/pinned", description: "Pin endeavor to profile", auth: true },
      { method: "GET", path: "/api/collections", description: "List bookmark collections", auth: true },
      { method: "POST", path: "/api/collections", description: "Create collection", auth: true },
      { method: "GET", path: "/api/notifications", description: "Get notifications", auth: true },
      { method: "POST", path: "/api/reports", description: "Report content", auth: true },
      { method: "GET", path: "/api/export", description: "Export user data as JSON", auth: true },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-code-blue/20 text-code-blue border-code-blue/30",
  POST: "bg-code-green/20 text-code-green border-code-green/30",
  PATCH: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
  DELETE: "bg-red-400/20 text-red-400 border-red-400/30",
  PUT: "bg-purple-400/20 text-purple-400 border-purple-400/30",
};

export default function ApiDocsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("Public");
  const [search, setSearch] = useState("");

  const filtered = ENDPOINTS.map((section) => ({
    ...section,
    endpoints: section.endpoints.filter(
      (e) =>
        e.path.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.endpoints.length > 0);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "API Docs", href: "/api-docs" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">API Documentation</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Public and authenticated endpoints for the Endeavor platform
        </p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search endpoints..."
          className="mb-8 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
        />

        <div className="space-y-4">
          {filtered.map((section) => (
            <div key={section.section} className="border border-medium-gray/20">
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.section ? null : section.section
                  )
                }
                className="flex w-full items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-semibold uppercase tracking-widest text-code-green">
                  {"// "}{section.section}
                </span>
                <span className="text-xs text-medium-gray">
                  {section.endpoints.length} endpoints
                  {expandedSection === section.section ? " −" : " +"}
                </span>
              </button>

              {expandedSection === section.section && (
                <div className="border-t border-medium-gray/10">
                  {section.endpoints.map((ep, i) => (
                    <div
                      key={i}
                      className="border-b border-medium-gray/10 px-4 py-3 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`shrink-0 border px-2 py-0.5 text-xs font-bold ${
                            METHOD_COLORS[ep.method] || "text-medium-gray"
                          }`}
                        >
                          {ep.method}
                        </span>
                        <div className="min-w-0 flex-1">
                          <code className="text-sm text-light-gray break-all">
                            {ep.path}
                          </code>
                          <p className="mt-1 text-xs text-medium-gray">
                            {ep.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {ep.auth && (
                              <span className="border border-yellow-400/20 bg-yellow-400/5 px-2 py-0.5 text-xs text-yellow-400">
                                Auth Required
                              </span>
                            )}
                            {!ep.auth && (
                              <span className="border border-code-green/20 bg-code-green/5 px-2 py-0.5 text-xs text-code-green">
                                Public
                              </span>
                            )}
                          </div>
                          {ep.params && (
                            <p className="mt-1 text-xs text-medium-gray">
                              Params: {ep.params.join(", ")}
                            </p>
                          )}
                          {ep.body && (
                            <p className="mt-1 text-xs text-medium-gray">
                              Body: <code className="text-code-blue">{ep.body}</code>
                            </p>
                          )}
                          {ep.response && (
                            <p className="mt-1 text-xs text-medium-gray">
                              Response: <code className="text-code-green">{ep.response}</code>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 border border-medium-gray/20 p-6">
          <h2 className="mb-2 text-sm font-semibold text-code-green">Authentication</h2>
          <p className="mb-4 text-sm text-medium-gray">
            Authenticated endpoints require a valid session cookie. Use the{" "}
            <code className="text-code-blue">/api/auth/sign-in</code> endpoint to authenticate.
          </p>
          <h2 className="mb-2 text-sm font-semibold text-code-green">Rate Limiting</h2>
          <p className="text-sm text-medium-gray">
            API requests are rate-limited to 60 requests per minute per IP address.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
