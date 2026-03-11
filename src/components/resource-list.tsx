"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Resource = {
  id: string;
  title: string;
  url: string | null;
  description: string | null;
  resource_type: string;
  created_at: string;
  added_by_name: string;
};

const typeIcons: Record<string, string> = {
  link: "->",
  document: "[]",
  video: ">>",
  tool: "{}",
  reference: "##",
};

const typeColors: Record<string, string> = {
  link: "text-code-blue",
  document: "text-yellow-400",
  video: "text-purple-400",
  tool: "text-code-green",
  reference: "text-orange-400",
};

export function ResourceList({
  endeavorId,
  canAdd = false,
}: {
  endeavorId: string;
  canAdd?: boolean;
}) {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState("link");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/resources`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setResources)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function addResource() {
    if (!title.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), url: url || undefined, description: description || undefined, resourceType }),
    });
    if (res.ok) {
      const resource = await res.json();
      setResources((prev) => [{ ...resource, added_by_name: "You" }, ...prev]);
      setTitle("");
      setUrl("");
      setDescription("");
      setShowForm(false);
      toast("Resource added", "success");
    }
    setAdding(false);
  }

  async function removeResource(resourceId: string) {
    const res = await fetch(`/api/endeavors/${endeavorId}/resources`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    });
    if (res.ok) {
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      toast("Resource removed");
    }
  }

  if (loading || (resources.length === 0 && !canAdd)) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// resources"}
        </h4>
        {canAdd && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-code-blue hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "+ Add"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-3 space-y-2 pb-3 border-b border-medium-gray/10">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource title"
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (optional)"
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <div className="flex gap-2">
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="border border-medium-gray/30 bg-black px-2 py-1.5 text-xs text-white"
            >
              <option value="link">Link</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="tool">Tool</option>
              <option value="reference">Reference</option>
            </select>
            <button
              onClick={addResource}
              disabled={adding || !title.trim()}
              className="px-3 py-1.5 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {adding ? "..." : "Add"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {resources.map((r) => (
          <div key={r.id} className="flex items-start gap-2 group">
            <span className={`font-mono text-xs font-bold mt-0.5 ${typeColors[r.resource_type] || "text-medium-gray"}`}>
              {typeIcons[r.resource_type] || "->"}
            </span>
            <div className="flex-1 min-w-0">
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-light-gray hover:text-code-green transition-colors"
                >
                  {r.title}
                </a>
              ) : (
                <span className="text-sm text-light-gray">{r.title}</span>
              )}
              {r.description && (
                <p className="text-xs text-medium-gray mt-0.5">{r.description}</p>
              )}
              <p className="text-xs text-medium-gray">
                {r.added_by_name} · {formatTimeAgo(r.created_at)}
              </p>
            </div>
            {canAdd && (
              <button
                onClick={() => removeResource(r.id)}
                className="text-xs text-medium-gray hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
