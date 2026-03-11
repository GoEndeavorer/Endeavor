"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  price_type: string;
  price: string | null;
  tags: string[];
  seller_id: string;
  seller_name: string;
  view_count: number;
  created_at: string;
};

const categories = ["all", "service", "design", "development", "writing", "marketing", "consulting", "other"];
const types = ["all", "offer", "request"];

export default function MarketplacePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listCategory, setListCategory] = useState("service");
  const [listType, setListType] = useState("offer");
  const [priceType, setPriceType] = useState("negotiable");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    let url = "/api/marketplace";
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (type !== "all") params.set("type", type);
    if (params.toString()) url += `?${params}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setListings)
      .finally(() => setLoading(false));
  }, [category, type]);

  async function createListing() {
    if (!title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description || undefined,
        category: listCategory,
        type: listType,
        priceType,
        price: price ? Number(price) : undefined,
      }),
    });
    if (res.ok) {
      const listing = await res.json();
      setListings((prev) => [{ ...listing, seller_name: session!.user.name }, ...prev]);
      setTitle("");
      setDescription("");
      setPrice("");
      setShowForm(false);
      toast("Listing created!", "success");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Marketplace", href: "/marketplace" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Marketplace</h1>
            <p className="text-sm text-medium-gray">Services, skills, and resources</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
            >
              {showForm ? "Cancel" : "Create Listing"}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  category === cat ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  type === t ? "bg-code-blue text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// new listing"}
            </h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you offering or looking for?"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={listCategory} onChange={(e) => setListCategory(e.target.value)} className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white">
                {categories.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={listType} onChange={(e) => setListType(e.target.value)} className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white">
                <option value="offer">Offering</option>
                <option value="request">Looking for</option>
              </select>
              <select value={priceType} onChange={(e) => setPriceType(e.target.value)} className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white">
                <option value="negotiable">Negotiable</option>
                <option value="fixed">Fixed price</option>
                <option value="free">Free</option>
                <option value="trade">Trade/Barter</option>
              </select>
              {priceType === "fixed" && (
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price ($)"
                  type="number"
                  className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                />
              )}
            </div>
            <button
              onClick={createListing}
              disabled={submitting || !title.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Post Listing"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : listings.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No listings yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {listings.map((listing) => (
              <div key={listing.id} className="border border-medium-gray/20 p-4 hover:border-code-green/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-1.5 py-0.5 border ${
                    listing.type === "offer" ? "border-code-green/30 text-code-green" : "border-code-blue/30 text-code-blue"
                  }`}>
                    {listing.type === "offer" ? "Offering" : "Looking for"}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 border border-medium-gray/20 text-medium-gray">
                    {listing.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-light-gray mb-1">{listing.title}</h3>
                {listing.description && (
                  <p className="text-xs text-medium-gray line-clamp-2 mb-2">{listing.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={`/users/${listing.seller_id}`} className="text-xs text-code-blue hover:text-code-green">
                      {listing.seller_name}
                    </Link>
                    <span className="text-xs text-medium-gray">{formatTimeAgo(listing.created_at)}</span>
                  </div>
                  <span className="text-xs font-semibold text-code-green">
                    {listing.price_type === "free" ? "Free" :
                     listing.price_type === "fixed" && listing.price ? `$${Number(listing.price).toLocaleString()}` :
                     listing.price_type === "trade" ? "Trade" : "Negotiable"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
