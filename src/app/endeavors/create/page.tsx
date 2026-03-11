"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { ImagePicker } from "@/components/image-picker";
import { analytics } from "@/lib/analytics";

const categories = [
  "Adventure",
  "Scientific",
  "Creative",
  "Tech",
  "Cultural",
  "Community",
];

const templates = [
  {
    name: "Hiking Expedition",
    category: "Adventure",
    description: "A multi-day hiking trip through scenic trails. We'll plan the route, split costs for transport and camping, and capture the experience together.",
    needs: ["Photographer", "Navigation", "First Aid"],
    locationType: "in-person" as const,
  },
  {
    name: "Open Source Project",
    category: "Tech",
    description: "Build an open source tool that solves a real problem. Contributors of all skill levels welcome — from code to docs to design.",
    needs: ["Frontend Dev", "Backend Dev", "Designer", "Technical Writer"],
    locationType: "remote" as const,
  },
  {
    name: "Documentary Film",
    category: "Creative",
    description: "A short documentary exploring a compelling story. Looking for crew members to help with filming, editing, and production.",
    needs: ["Videographer", "Editor", "Sound Engineer", "Narrator"],
    locationType: "either" as const,
  },
  {
    name: "Community Workshop",
    category: "Community",
    description: "Organize a hands-on workshop to teach a valuable skill to the local community. Free and open to all skill levels.",
    needs: ["Instructor", "Venue", "Materials", "Marketing"],
    locationType: "in-person" as const,
  },
  {
    name: "Research Study",
    category: "Scientific",
    description: "A collaborative research project investigating an important question. Looking for researchers, data analysts, and domain experts.",
    needs: ["Researcher", "Data Analyst", "Subject Expert", "Editor"],
    locationType: "remote" as const,
  },
  {
    name: "Cultural Festival",
    category: "Cultural",
    description: "Plan and host a cultural celebration bringing together food, music, art, and traditions from diverse backgrounds.",
    needs: ["Event Planner", "Musicians", "Chefs", "Artists", "Volunteers"],
    locationType: "in-person" as const,
  },
];

export default function CreateEndeavorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("in-person");
  const [needsInput, setNeedsInput] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [costPerPerson, setCostPerPerson] = useState("");
  const [capacity, setCapacity] = useState("");
  const [fundingEnabled, setFundingEnabled] = useState(false);
  const [fundingGoal, setFundingGoal] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [joinType, setJoinType] = useState("open");
  const [showTemplates, setShowTemplates] = useState(true);

  // Auto-fill from URL template parameter (from /templates page)
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId) {
      fetch("/api/templates")
        .then((r) => (r.ok ? r.json() : []))
        .then((tmps: { id: string; name: string; description: string; category: string; suggestedNeeds: string[] }[]) => {
          const tmpl = tmps.find((t: { id: string }) => t.id === templateId);
          if (tmpl) {
            setTitle(tmpl.name);
            setDescription(tmpl.description);
            setCategory(tmpl.category);
            setNeeds(tmpl.suggestedNeeds);
            setShowTemplates(false);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  function applyTemplate(tmpl: (typeof templates)[number]) {
    setTitle(tmpl.name);
    setDescription(tmpl.description);
    setCategory(tmpl.category);
    setNeeds(tmpl.needs);
    setLocationType(tmpl.locationType);
    setShowTemplates(false);
  }

  function addNeed() {
    const trimmed = needsInput.trim();
    if (trimmed && !needs.includes(trimmed)) {
      setNeeds([...needs, trimmed]);
      setNeedsInput("");
    }
  }

  function removeNeed(need: string) {
    setNeeds(needs.filter((n) => n !== need));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/endeavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          location: location || null,
          locationType,
          needs,
          costPerPerson: costPerPerson || null,
          capacity: capacity || null,
          fundingEnabled,
          fundingGoal: fundingEnabled ? fundingGoal || null : null,
          imageUrl: imageUrl || null,
          joinType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create endeavor");
        return;
      }

      const data = await res.json();
      analytics.endeavorCreated(data.id, category);
      router.push(`/endeavors/${data.id}/dashboard`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-4 text-lg text-medium-gray">
            You need to be logged in to create an endeavor.
          </p>
          <Link
            href="/login"
            className="border border-code-green px-6 py-3 text-sm font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Create", href: "/endeavors/create" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Create an Endeavor</h1>
        <p className="mb-4 text-sm text-medium-gray">
          Describe what you want to do. Others will find it and join.
        </p>

        {/* Quick-start templates */}
        {showTemplates && !title && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-code-green">
                Quick Start Templates
              </p>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-xs text-medium-gray hover:text-white"
              >
                Hide
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => applyTemplate(tmpl)}
                  className="border border-medium-gray/20 p-3 text-left transition-colors hover:border-code-green/50"
                >
                  <p className="text-sm font-semibold">{tmpl.name}</p>
                  <p className="text-xs text-medium-gray">{tmpl.category} &middot; {tmpl.locationType}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Completeness indicator */}
        {(() => {
          const fields = [
            !!title,
            !!description,
            !!category,
            !!location,
            needs.length > 0,
            !!imageUrl,
          ];
          const filled = fields.filter(Boolean).length;
          const pct = Math.round((filled / fields.length) * 100);
          return (
            <div className="mb-8">
              <div className="mb-1 flex justify-between text-xs text-medium-gray">
                <span>{filled}/{fields.length} fields completed</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1 w-full bg-medium-gray/20">
                <div
                  className="h-1 bg-code-green transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}

        {error && (
          <div className="mb-6 border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-1 block text-sm text-light-gray">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              placeholder="e.g., Patagonia Research & Music Expedition"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-1 block text-sm text-light-gray">
              Description *
              <span className="ml-2 text-[10px] text-medium-gray/50">Supports **bold**, *italic*, `code`, [links](url)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              placeholder="What is this endeavor about? What will participants experience?"
            />
            <p className="mt-1 text-right text-xs text-medium-gray">
              {description.length} characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm text-light-gray">
              Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                    category === cat
                      ? "border-code-green bg-code-green text-black"
                      : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className="mb-1 block text-sm text-light-gray">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                placeholder="e.g., Patagonia, Chile"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-light-gray">
                Location Type
              </label>
              <div className="flex gap-2">
                {["in-person", "remote", "either"].map((lt) => (
                  <button
                    key={lt}
                    type="button"
                    onClick={() => setLocationType(lt)}
                    className={`flex-1 border px-2 py-3 text-xs uppercase transition-colors ${
                      locationType === lt
                        ? "border-code-blue bg-code-blue text-black font-semibold"
                        : "border-medium-gray/50 text-medium-gray hover:border-code-blue"
                    }`}
                  >
                    {lt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Needs */}
          <div>
            <label className="mb-1 block text-sm text-light-gray">
              What do you need?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={needsInput}
                onChange={(e) => setNeedsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNeed();
                  }
                }}
                className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                placeholder="e.g., Videographer, Funding, Guide"
              />
              <button
                type="button"
                onClick={addNeed}
                className="border border-medium-gray/50 px-4 py-3 text-sm text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
              >
                Add
              </button>
            </div>
            {needs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {needs.map((need) => (
                  <span
                    key={need}
                    className="flex items-center gap-1 bg-white/5 px-2 py-1 text-xs text-light-gray"
                  >
                    {need}
                    <button
                      type="button"
                      onClick={() => removeNeed(need)}
                      className="ml-1 text-medium-gray hover:text-red-400"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cost & Capacity */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cost" className="mb-1 block text-sm text-light-gray">
                Cost per Person ($)
              </label>
              <input
                id="cost"
                type="number"
                value={costPerPerson}
                onChange={(e) => setCostPerPerson(e.target.value)}
                min="0"
                className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                placeholder="0 for free"
              />
            </div>
            <div>
              <label htmlFor="capacity" className="mb-1 block text-sm text-light-gray">
                Max Participants
              </label>
              <input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>

          {/* Join type */}
          <div>
            <label className="mb-2 block text-sm text-light-gray">
              Joining
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJoinType("open")}
                className={`flex-1 border px-4 py-3 text-xs uppercase transition-colors ${
                  joinType === "open"
                    ? "border-code-green text-code-green font-semibold"
                    : "border-medium-gray/50 text-medium-gray"
                }`}
              >
                Open — anyone can join
              </button>
              <button
                type="button"
                onClick={() => setJoinType("request")}
                className={`flex-1 border px-4 py-3 text-xs uppercase transition-colors ${
                  joinType === "request"
                    ? "border-code-green text-code-green font-semibold"
                    : "border-medium-gray/50 text-medium-gray"
                }`}
              >
                Request — you approve
              </button>
            </div>
          </div>

          {/* Funding toggle */}
          <div className="border border-medium-gray/30 p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={fundingEnabled}
                onChange={(e) => setFundingEnabled(e.target.checked)}
                className="h-4 w-4 accent-code-green"
              />
              <span className="text-sm">
                Enable crowdfunding for this endeavor
              </span>
            </label>
            {fundingEnabled && (
              <div className="mt-4">
                <label htmlFor="fundingGoal" className="mb-1 block text-sm text-light-gray">
                  Funding Goal ($)
                </label>
                <input
                  id="fundingGoal"
                  type="number"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  min="1"
                  className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
                  placeholder="How much do you need to raise?"
                />
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-1 block text-sm text-light-gray">
              Cover Image
            </label>
            <ImagePicker
              value={imageUrl}
              onChange={setImageUrl}
              category={category}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !title || !description || !category}
            className="w-full border border-code-green bg-code-green px-4 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-50"
          >
            {loading ? "Creating..." : "Launch Endeavor"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
