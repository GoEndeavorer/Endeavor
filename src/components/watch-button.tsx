"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

export function WatchButton({ endeavorId }: { endeavorId: string }) {
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/watch`)
      .then((r) => (r.ok ? r.json() : { watching: false }))
      .then((data) => setWatching(data.watching))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function toggle() {
    setToggling(true);
    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/watch`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setWatching(data.watching);
        toast(data.watching ? "Now watching this endeavor" : "Stopped watching");
      }
    } catch {
      toast("Failed to update", "error");
    } finally {
      setToggling(false);
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={toggle}
      disabled={toggling}
      className={`border px-3 py-1.5 text-xs font-semibold uppercase transition-colors disabled:opacity-50 ${
        watching
          ? "border-code-blue bg-code-blue/10 text-code-blue hover:bg-transparent"
          : "border-medium-gray/50 text-medium-gray hover:border-code-blue hover:text-code-blue"
      }`}
    >
      {watching ? "Watching" : "Watch"}
    </button>
  );
}
