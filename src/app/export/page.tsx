"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type ExportType = {
  key: string;
  label: string;
  description: string;
};

const EXPORT_TYPES: ExportType[] = [
  { key: "endeavors", label: "Endeavors", description: "All your created endeavors with details" },
  { key: "tasks", label: "Tasks", description: "Tasks you created or are assigned to" },
  { key: "time", label: "Time Entries", description: "All logged time entries" },
];

export default function ExportPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  async function exportData(type: string, format: "json" | "csv") {
    setExporting(type);
    try {
      const res = await fetch(`/api/reports/export?type=${type}&format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      if (format === "csv") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-export.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast("CSV downloaded!", "success");
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-export.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast("JSON downloaded!", "success");
      }
    } catch {
      toast("Export failed", "error");
    }
    setExporting(null);
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Export", href: "/export" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
          <p className="text-sm text-medium-gray">Sign in to export data</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Export", href: "/export" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-1">Export Data</h1>
        <p className="text-sm text-medium-gray mb-8">Download your data in JSON or CSV format</p>

        <div className="space-y-4">
          {EXPORT_TYPES.map((type) => (
            <div key={type.key} className="border border-medium-gray/20 p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-light-gray">{type.label}</h3>
                  <p className="text-xs text-medium-gray mt-1">{type.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => exportData(type.key, "json")}
                  disabled={exporting === type.key}
                  className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
                >
                  {exporting === type.key ? "Exporting..." : "Export JSON"}
                </button>
                <button
                  onClick={() => exportData(type.key, "csv")}
                  disabled={exporting === type.key}
                  className="px-4 py-2 text-xs font-semibold border border-code-blue text-code-blue hover:bg-code-blue hover:text-black transition-colors disabled:opacity-50"
                >
                  {exporting === type.key ? "Exporting..." : "Export CSV"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border border-medium-gray/20 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">{"// about your data"}</h3>
          <ul className="space-y-2 text-xs text-medium-gray">
            <li>Your data is exported in real-time from our database</li>
            <li>JSON format preserves all data types and nested structures</li>
            <li>CSV format is compatible with spreadsheets and data tools</li>
            <li>Exports include only data you created or are assigned to</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
