"use client";

import { useState } from "react";

// Curated stock images for each category, used as quick-pick options
const stockImages: Record<string, { url: string; label: string }[]> = {
  Adventure: [
    { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=400&fit=crop", label: "Mountains" },
    { url: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&h=400&fit=crop", label: "Hiking" },
    { url: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800&h=400&fit=crop", label: "Camping" },
  ],
  Scientific: [
    { url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=400&fit=crop", label: "Laboratory" },
    { url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop", label: "Research" },
    { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop", label: "Data" },
  ],
  Creative: [
    { url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=400&fit=crop", label: "Art Studio" },
    { url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop", label: "Books" },
    { url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop", label: "Film" },
  ],
  Tech: [
    { url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop", label: "Circuit" },
    { url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop", label: "Code" },
    { url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop", label: "Workspace" },
  ],
  Cultural: [
    { url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop", label: "Festival" },
    { url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop", label: "Concert" },
    { url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=400&fit=crop", label: "Art" },
  ],
  Community: [
    { url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop", label: "People" },
    { url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop", label: "Group" },
    { url: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=400&fit=crop", label: "Community" },
  ],
};

type ImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  category?: string;
};

export function ImagePicker({ value, onChange, category }: ImagePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const suggestions = category ? stockImages[category] || [] : [];

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
          placeholder="https://example.com/image.jpg"
        />
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="border border-medium-gray/50 px-3 py-3 text-xs text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
          >
            {showPicker ? "Close" : "Suggest"}
          </button>
        )}
      </div>

      {value && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-32 w-full object-cover border border-medium-gray/20"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {showPicker && suggestions.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {suggestions.map((img) => (
            <button
              key={img.url}
              type="button"
              onClick={() => {
                onChange(img.url);
                setShowPicker(false);
              }}
              className={`group relative overflow-hidden border transition-colors ${
                value === img.url
                  ? "border-code-green"
                  : "border-medium-gray/20 hover:border-code-blue/50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.label}
                className="h-20 w-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[10px] text-white">
                {img.label}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-1 text-xs text-medium-gray">
        Paste an image URL or{" "}
        {suggestions.length > 0 ? "pick a suggested image" : "use any direct image link"}
      </p>
    </div>
  );
}
