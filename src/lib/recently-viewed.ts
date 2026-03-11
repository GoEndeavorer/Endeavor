const STORAGE_KEY = "endeavor_recently_viewed";
const MAX_ITEMS = 10;

type RecentItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string | null;
  viewedAt: number;
};

export function getRecentlyViewed(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: Omit<RecentItem, "viewedAt">) {
  if (typeof window === "undefined") return;
  try {
    const items = getRecentlyViewed().filter((i) => i.id !== item.id);
    items.unshift({ ...item, viewedAt: Date.now() });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_ITEMS))
    );
  } catch {}
}
