"use client";

import { useState, useRef } from "react";
import { useToast } from "@/components/toast";

export function SettingsExportImport() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/settings/export");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+)"/)?.[1] ?? "endeavor-settings.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast("Settings exported", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Export failed",
        "error"
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("File is not valid JSON");
      }

      const res = await fetch("/api/settings/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      // Apply client-side preferences from the import response
      if (data.preferences && typeof data.preferences === "object") {
        for (const [key, value] of Object.entries(data.preferences)) {
          try {
            localStorage.setItem(
              key,
              typeof value === "string" ? value : JSON.stringify(value)
            );
          } catch {}
        }
      }

      const count = data.appliedFields?.length ?? 0;
      toast(
        count > 0
          ? `Imported ${count} setting${count === 1 ? "" : "s"} — reload to see changes`
          : "No settings to update",
        count > 0 ? "success" : "info"
      );
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Import failed",
        "error"
      );
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        border: "1px solid #333",
        padding: "1.5rem",
        fontFamily: "monospace",
        maxWidth: "32rem",
      }}
    >
      <h3
        style={{
          margin: "0 0 0.25rem",
          fontSize: "0.875rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#aaa",
        }}
      >
        {"// export / import"}
      </h3>
      <p
        style={{
          margin: "0 0 1.25rem",
          fontSize: "0.8125rem",
          color: "#888",
          lineHeight: 1.5,
        }}
      >
        Download your settings as JSON or restore from a previous export.
        Sensitive fields (email, id) are never overwritten.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            padding: "0.5rem 1rem",
            fontFamily: "monospace",
            fontSize: "0.8125rem",
            background: "transparent",
            border: "1px solid #555",
            color: "#ccc",
            cursor: exporting ? "wait" : "pointer",
            opacity: exporting ? 0.5 : 1,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) =>
            !exporting &&
            ((e.currentTarget.style.borderColor = "#999"))
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "#555")
          }
        >
          {exporting ? "exporting..." : "$ export"}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          style={{
            padding: "0.5rem 1rem",
            fontFamily: "monospace",
            fontSize: "0.8125rem",
            background: "transparent",
            border: "1px solid #555",
            color: "#ccc",
            cursor: importing ? "wait" : "pointer",
            opacity: importing ? 0.5 : 1,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) =>
            !importing &&
            ((e.currentTarget.style.borderColor = "#999"))
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "#555")
          }
        >
          {importing ? "importing..." : "$ import"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
          }}
        />
      </div>
    </div>
  );
}
