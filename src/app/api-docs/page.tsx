"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  response: string;
};

type ApiGroup = {
  name: string;
  description: string;
  endpoints: Endpoint[];
};

const API_GROUPS: ApiGroup[] = [
  {
    name: "Endeavors",
    description: "Create, read, and search endeavors on the platform.",
    endpoints: [
      {
        method: "GET",
        path: "/api/endeavors",
        description: "List all endeavors. Supports pagination, filtering by category, status, and sort order.",
        response: `{
  "endeavors": [
    {
      "id": "abc123",
      "title": "Build a Community Garden",
      "description": "...",
      "category": "environment",
      "status": "active",
      "memberCount": 12,
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "total": 148,
  "page": 1,
  "limit": 20
}`,
      },
      {
        method: "GET",
        path: "/api/endeavors/[id]",
        description: "Get full details for a single endeavor by its ID.",
        response: `{
  "id": "abc123",
  "title": "Build a Community Garden",
  "description": "A collaborative effort to...",
  "category": "environment",
  "status": "active",
  "creator": { "id": "u1", "name": "Alice" },
  "memberCount": 12,
  "fundingGoal": 5000,
  "fundingRaised": 2350,
  "tags": ["gardening", "community"],
  "createdAt": "2026-01-15T08:00:00Z"
}`,
      },
      {
        method: "GET",
        path: "/api/search?q=",
        description: "Search endeavors, users, and stories by keyword query string.",
        response: `{
  "endeavors": [
    { "id": "abc123", "title": "...", "category": "...", "status": "..." }
  ],
  "users": [
    { "id": "u1", "name": "Alice", "bio": "..." }
  ],
  "stories": [
    { "id": "s1", "title": "Our Journey So Far" }
  ]
}`,
      },
    ],
  },
  {
    name: "Feed",
    description: "Paginated feed of endeavors and trending content.",
    endpoints: [
      {
        method: "GET",
        path: "/api/feed",
        description: "Paginated feed of recent endeavors. Accepts page, limit, category, and sort params.",
        response: `{
  "items": [
    {
      "id": "abc123",
      "title": "Build a Community Garden",
      "category": "environment",
      "status": "active",
      "memberCount": 12,
      "createdAt": "2026-01-15T08:00:00Z"
    }
  ],
  "nextCursor": "eyJwIjoyf",
  "hasMore": true
}`,
      },
      {
        method: "GET",
        path: "/api/feed/trending",
        description: "Returns currently trending endeavors ranked by recent activity and engagement.",
        response: `{
  "trending": [
    {
      "id": "abc123",
      "title": "Build a Community Garden",
      "category": "environment",
      "trendScore": 94.5,
      "memberCount": 12,
      "recentActivity": 38
    }
  ]
}`,
      },
    ],
  },
  {
    name: "Users",
    description: "Public user profiles and contribution history.",
    endpoints: [
      {
        method: "GET",
        path: "/api/users/[userId]",
        description: "Get a public user profile including bio, skills, and social links.",
        response: `{
  "id": "u1",
  "name": "Alice",
  "bio": "Builder of things.",
  "image": "https://...",
  "skills": ["design", "gardening"],
  "socialLinks": {
    "github": "https://github.com/alice",
    "twitter": "https://twitter.com/alice"
  },
  "joinedAt": "2025-11-01T00:00:00Z",
  "endeavorCount": 5
}`,
      },
      {
        method: "GET",
        path: "/api/users/[userId]/contributions",
        description: "List a user's contributions across all endeavors they have joined.",
        response: `{
  "contributions": [
    {
      "endeavorId": "abc123",
      "endeavorTitle": "Build a Community Garden",
      "role": "member",
      "tasksCompleted": 7,
      "discussionPosts": 14,
      "joinedAt": "2026-01-20T00:00:00Z"
    }
  ],
  "totalEndeavors": 5,
  "totalTasks": 23
}`,
      },
    ],
  },
  {
    name: "Activity",
    description: "Platform-wide activity stream and streak tracking.",
    endpoints: [
      {
        method: "GET",
        path: "/api/activity",
        description: "Platform-wide activity feed showing recent events across all endeavors.",
        response: `{
  "events": [
    {
      "id": "evt1",
      "type": "endeavor_created",
      "actor": { "id": "u1", "name": "Alice" },
      "target": { "id": "abc123", "title": "..." },
      "timestamp": "2026-03-10T14:30:00Z"
    }
  ],
  "nextCursor": "eyJwIjoyf"
}`,
      },
      {
        method: "GET",
        path: "/api/activity/streak",
        description: "Get the authenticated user's current and longest activity streaks.",
        response: `{
  "currentStreak": 7,
  "longestStreak": 21,
  "lastActiveDate": "2026-03-10",
  "streakHistory": [
    { "date": "2026-03-10", "active": true },
    { "date": "2026-03-09", "active": true }
  ]
}`,
      },
    ],
  },
  {
    name: "Tags & Categories",
    description: "Browse available tags and categories used across the platform.",
    endpoints: [
      {
        method: "GET",
        path: "/api/tags",
        description: "List popular tags/skills with usage counts, sorted by popularity.",
        response: `{
  "tags": [
    { "name": "design", "count": 42 },
    { "name": "gardening", "count": 31 },
    { "name": "coding", "count": 28 }
  ]
}`,
      },
      {
        method: "GET",
        path: "/api/categories",
        description: "List all categories with the number of endeavors in each.",
        response: `{
  "categories": [
    { "slug": "environment", "label": "Environment", "count": 34 },
    { "slug": "technology", "label": "Technology", "count": 29 },
    { "slug": "education", "label": "Education", "count": 22 }
  ]
}`,
      },
    ],
  },
  {
    name: "Analytics",
    description: "Platform-level analytics and overview statistics.",
    endpoints: [
      {
        method: "GET",
        path: "/api/analytics/overview",
        description: "High-level platform analytics including user, endeavor, and activity counts.",
        response: `{
  "totalUsers": 1284,
  "totalEndeavors": 347,
  "activeEndeavors": 198,
  "completedEndeavors": 89,
  "totalContributions": 4521,
  "newUsersThisWeek": 42,
  "newEndeavorsThisWeek": 15,
  "generatedAt": "2026-03-11T00:00:00Z"
}`,
      },
    ],
  },
  {
    name: "Stories",
    description: "Read and browse stories published by endeavor members.",
    endpoints: [
      {
        method: "GET",
        path: "/api/stories",
        description: "List all published stories across the platform. Supports pagination.",
        response: `{
  "stories": [
    {
      "id": "s1",
      "title": "Our Journey So Far",
      "excerpt": "When we first started...",
      "author": { "id": "u1", "name": "Alice" },
      "endeavorId": "abc123",
      "publishedAt": "2026-02-20T10:00:00Z"
    }
  ],
  "total": 56,
  "page": 1
}`,
      },
      {
        method: "GET",
        path: "/api/stories/[storyId]",
        description: "Get the full content of a single story by ID.",
        response: `{
  "id": "s1",
  "title": "Our Journey So Far",
  "content": "When we first started this endeavor...",
  "author": { "id": "u1", "name": "Alice" },
  "endeavorId": "abc123",
  "endeavorTitle": "Build a Community Garden",
  "publishedAt": "2026-02-20T10:00:00Z",
  "commentCount": 8
}`,
      },
    ],
  },
  {
    name: "Leaderboard",
    description: "Rankings of top creators and contributors.",
    endpoints: [
      {
        method: "GET",
        path: "/api/leaderboard",
        description: "Get ranked lists of top creators, contributors, and most active users.",
        response: `{
  "creators": [
    { "id": "u1", "name": "Alice", "endeavorsCreated": 8, "rank": 1 }
  ],
  "contributors": [
    { "id": "u2", "name": "Bob", "tasksCompleted": 45, "rank": 1 }
  ],
  "mostActive": [
    { "id": "u3", "name": "Carol", "activityScore": 312, "rank": 1 }
  ]
}`,
      },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-code-blue/20 text-code-blue border-code-blue/30",
  POST: "bg-code-green/20 text-code-green border-code-green/30",
  PATCH: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
  DELETE: "bg-red-400/20 text-red-400 border-red-400/30",
};

export default function ApiDocsPage() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Endeavors"])
  );
  const [search, setSearch] = useState("");

  function toggleGroup(name: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  const filtered = API_GROUPS.map((group) => ({
    ...group,
    endpoints: group.endpoints.filter(
      (ep) =>
        ep.path.toLowerCase().includes(search.toLowerCase()) ||
        ep.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.endpoints.length > 0);

  const totalEndpoints = API_GROUPS.reduce(
    (sum, g) => sum + g.endpoints.length,
    0
  );

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "API Docs", href: "/api-docs" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-[family-name:var(--font-fira-code)] text-2xl font-bold">
            API Documentation
          </h1>
          <p className="text-sm text-medium-gray">
            Public endpoints for the Endeavor platform.{" "}
            <span className="text-code-green">{totalEndpoints}</span> endpoints
            across{" "}
            <span className="text-code-green">{API_GROUPS.length}</span> groups.
          </p>
        </div>

        {/* Terminal-style info block */}
        <div className="mb-8 border border-medium-gray/20 bg-black/50 p-4 font-[family-name:var(--font-fira-code)] text-xs leading-relaxed">
          <p className="text-medium-gray">
            <span className="text-code-green">$</span> curl -s
            https://endeavor.dev/api/endeavors | jq .
          </p>
          <p className="mt-2 text-medium-gray">
            <span className="text-code-green">Base URL</span>{" "}
            <span className="text-light-gray">
              https://endeavor.dev
            </span>
          </p>
          <p className="text-medium-gray">
            <span className="text-code-green">Format{"  "}</span>{" "}
            <span className="text-light-gray">JSON</span>
          </p>
          <p className="text-medium-gray">
            <span className="text-code-green">Rate{"    "}</span>{" "}
            <span className="text-light-gray">
              60 requests/min per IP
            </span>
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-[family-name:var(--font-fira-code)] text-sm text-code-green">
            &gt;
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoints..."
            className="w-full border border-medium-gray/30 bg-transparent py-3 pl-8 pr-4 font-[family-name:var(--font-fira-code)] text-sm text-white outline-none transition-colors focus:border-code-green"
          />
        </div>

        {/* API Groups */}
        <div className="space-y-4">
          {filtered.map((group) => {
            const isExpanded = expandedGroups.has(group.name);
            return (
              <div
                key={group.name}
                className="border border-medium-gray/20 transition-colors"
              >
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-code-green">
                      {"// "}{group.name}
                    </span>
                    <p className="mt-1 text-xs text-medium-gray">
                      {group.description}
                    </p>
                  </div>
                  <span className="shrink-0 ml-4 font-[family-name:var(--font-fira-code)] text-xs text-medium-gray">
                    {group.endpoints.length}{" "}
                    {group.endpoints.length === 1 ? "endpoint" : "endpoints"}
                    <span className="ml-2">{isExpanded ? "[-]" : "[+]"}</span>
                  </span>
                </button>

                {/* Endpoints */}
                {isExpanded && (
                  <div className="border-t border-medium-gray/10">
                    {group.endpoints.map((ep, i) => (
                      <div
                        key={i}
                        className="border-b border-medium-gray/10 px-4 py-4 last:border-b-0"
                      >
                        {/* Method + Path */}
                        <div className="flex items-start gap-3">
                          <span
                            className={`shrink-0 border px-2 py-0.5 font-[family-name:var(--font-fira-code)] text-xs font-bold ${
                              METHOD_COLORS[ep.method] || "text-medium-gray"
                            }`}
                          >
                            {ep.method}
                          </span>
                          <div className="min-w-0 flex-1">
                            <code className="font-[family-name:var(--font-fira-code)] text-sm text-light-gray break-all">
                              {ep.path}
                            </code>
                            <p className="mt-1 text-xs text-medium-gray">
                              {ep.description}
                            </p>
                          </div>
                        </div>

                        {/* Response shape */}
                        <div className="mt-3 ml-0 sm:ml-14">
                          <p className="mb-1 font-[family-name:var(--font-fira-code)] text-[10px] uppercase tracking-widest text-medium-gray">
                            Response
                          </p>
                          <pre className="overflow-x-auto border border-medium-gray/10 bg-black/60 p-3 font-[family-name:var(--font-fira-code)] text-xs leading-relaxed text-code-green/80">
                            <code>{ep.response}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty search state */}
        {filtered.length === 0 && search && (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="font-[family-name:var(--font-fira-code)] text-sm text-medium-gray">
              No endpoints match &quot;{search}&quot;
            </p>
          </div>
        )}

        {/* Authentication & Rate Limiting */}
        <div className="mt-12 space-y-6">
          <div className="border border-medium-gray/20 p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// authentication"}
            </h2>
            <p className="text-sm leading-relaxed text-medium-gray">
              Most read endpoints are public. Authenticated endpoints require a
              valid session cookie obtained via{" "}
              <code className="font-[family-name:var(--font-fira-code)] text-code-blue">
                /api/auth/sign-in
              </code>
              . Requests without a valid session to protected routes will return{" "}
              <code className="font-[family-name:var(--font-fira-code)] text-red-400">
                401 Unauthorized
              </code>
              .
            </p>
          </div>

          <div className="border border-medium-gray/20 p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// rate limiting"}
            </h2>
            <p className="text-sm leading-relaxed text-medium-gray">
              API requests are rate-limited to{" "}
              <span className="text-code-blue">60 requests per minute</span> per
              IP address. Exceeding this limit returns{" "}
              <code className="font-[family-name:var(--font-fira-code)] text-red-400">
                429 Too Many Requests
              </code>{" "}
              with a{" "}
              <code className="font-[family-name:var(--font-fira-code)] text-light-gray">
                Retry-After
              </code>{" "}
              header.
            </p>
          </div>

          <div className="border border-medium-gray/20 p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// error responses"}
            </h2>
            <pre className="overflow-x-auto font-[family-name:var(--font-fira-code)] text-xs leading-relaxed text-medium-gray">
              <code>{`{
  "error": "Not Found",
  "message": "The requested resource does not exist.",
  "status": 404
}`}</code>
            </pre>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
