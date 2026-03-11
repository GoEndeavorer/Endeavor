"use client";

import { useState, useRef } from "react";

type ImageUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB max

    // Create local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);

    // Upload
    uploadFile(file);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        setPreview(data.url);
      }
    } catch {
      // Upload failed, keep preview
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-code-green mb-2">
        {"// "}{label}
      </label>

      {preview ? (
        <div className="relative border border-medium-gray/20 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
          <div className="flex justify-between mt-2">
            {uploading && (
              <span className="text-xs text-medium-gray animate-pulse">Uploading...</span>
            )}
            <button
              onClick={handleRemove}
              className="text-xs text-red-400 hover:text-red-300 ml-auto"
            >
              [remove]
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border border-dashed border-medium-gray/30 p-8 text-center hover:border-code-green/30 transition-colors"
        >
          <span className="block text-lg text-medium-gray mb-1">+</span>
          <span className="text-xs text-medium-gray">
            Click to upload (max 5MB)
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
