"use client";

import { useState } from "react";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
};

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "120px",
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);

  function insertMarkdown(before: string, after: string = "") {
    const textarea = document.querySelector(".md-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);

    // Reset cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }

  return (
    <div className="border border-medium-gray/30 focus-within:border-code-green/50 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-medium-gray/20 px-2 py-1">
        <button
          type="button"
          onClick={() => insertMarkdown("**", "**")}
          className="px-2 py-0.5 text-xs text-medium-gray hover:text-light-gray transition-colors font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("*", "*")}
          className="px-2 py-0.5 text-xs text-medium-gray hover:text-light-gray transition-colors italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("`", "`")}
          className="px-2 py-0.5 text-xs text-medium-gray hover:text-light-gray transition-colors font-mono"
          title="Code"
        >
          {"<>"}
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("[", "](url)")}
          className="px-2 py-0.5 text-xs text-medium-gray hover:text-light-gray transition-colors"
          title="Link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("- ")}
          className="px-2 py-0.5 text-xs text-medium-gray hover:text-light-gray transition-colors"
          title="List"
        >
          List
        </button>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={`px-2 py-0.5 text-xs transition-colors ${
              preview ? "text-code-green" : "text-medium-gray hover:text-light-gray"
            }`}
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="p-3 text-sm text-light-gray prose prose-invert prose-sm max-w-none"
          style={{ minHeight }}
        >
          {value || <span className="text-medium-gray">Nothing to preview</span>}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="md-editor-textarea w-full bg-transparent p-3 text-sm text-light-gray outline-none resize-y font-mono placeholder:text-medium-gray/50"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
