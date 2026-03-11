"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";
import { estimateReadingTime } from "@/lib/reading-time";

type SavedStory = {
  id: string;
  saved_at: string;
  story_id: string;
  title: string;
  content: string;
  created_at: string;
  author_name: string;
  endeavor_title: string;
  endeavor_id: string;
};

export default function ReadingListPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/reading-list")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setStories(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  async function removeStory(storyId: string) {
    setStories((prev) => prev.filter((s) => s.story_id !== storyId));
    try {
      const res = await fetch("/api/reading-list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId }),
      });
      if (!res.ok) throw new Error();
      toast("Removed from reading list");
    } catch {
      toast("Failed to remove", "error");
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        <span className="animate-pulse font-mono text-sm">loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Reading List", href: "/reading-list" }} />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="text-xl font-bold mb-2">Reading List</h1>
        <p className="text-sm text-medium-gray mb-8">
          Stories you&apos;ve saved to read later.
        </p>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-medium-gray/10 border border-medium-gray/20" />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray mb-3">Your reading list is empty.</p>
            <Link href="/stories" className="text-xs text-code-blue hover:text-code-green transition-colors">
              Browse stories &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {stories.map((story) => (
              <div
                key={story.id}
                className="border border-medium-gray/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/stories/${story.story_id}`}
                      className="text-sm font-semibold hover:text-code-green transition-colors"
                    >
                      {story.title}
                    </Link>
                    <p className="text-xs text-medium-gray mt-1">
                      By {story.author_name} in{" "}
                      <Link
                        href={`/endeavors/${story.endeavor_id}`}
                        className="text-code-blue hover:text-code-green transition-colors"
                      >
                        {story.endeavor_title}
                      </Link>
                    </p>
                    <p className="text-xs text-medium-gray mt-1">
                      {estimateReadingTime(story.content)} min read &middot;{" "}
                      Saved {formatTimeAgo(story.saved_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeStory(story.story_id)}
                    className="shrink-0 text-xs text-medium-gray hover:text-red-400 transition-colors"
                  >
                    [remove]
                  </button>
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
