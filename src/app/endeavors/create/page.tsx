"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { analytics } from "@/lib/analytics";

const categories = [
  "Adventure",
  "Scientific",
  "Creative",
  "Tech",
  "Cultural",
  "Community",
];

export default function CreateEndeavorPage() {
  const router = useRouter();
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
      router.push(`/endeavors/${data.id}`);
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
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Endeavor
          </Link>
          <Link
            href="/feed"
            className="text-sm text-code-blue hover:text-code-green"
          >
            Back to Feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Create an Endeavor</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Describe what you want to do. Others will find it and join.
        </p>

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
                    need: {need}
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
            <label htmlFor="imageUrl" className="mb-1 block text-sm text-light-gray">
              Cover Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2 overflow-hidden border border-medium-gray/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Cover preview"
                  className="h-40 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
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
    </div>
  );
}
