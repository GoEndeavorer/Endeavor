"use client";

import { useState, useRef } from "react";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
};

export function TagInput({
  tags,
  onChange,
  placeholder = "Add tag...",
  maxTags = 10,
  suggestions = [],
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setInput("");
    setShowSuggestions(false);
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s.toLowerCase())
  );

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1 border border-medium-gray/30 p-2 focus-within:border-code-green/50 transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 border border-code-green/30 bg-code-green/5 px-2 py-0.5 text-xs text-code-green"
          >
            {tag}
            <button
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              className="text-code-green/50 hover:text-code-green ml-0.5"
            >
              x
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => input.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[100px] bg-transparent text-xs text-light-gray outline-none placeholder:text-medium-gray/50"
          />
        )}
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 border border-medium-gray/30 bg-black max-h-32 overflow-y-auto">
          {filteredSuggestions.slice(0, 5).map((s) => (
            <button
              key={s}
              onMouseDown={() => addTag(s)}
              className="block w-full px-3 py-1.5 text-left text-xs text-light-gray hover:bg-medium-gray/10 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="mt-1 text-xs text-medium-gray">Maximum {maxTags} tags reached</p>
      )}
    </div>
  );
}
