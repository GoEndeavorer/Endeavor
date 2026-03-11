const DRAFT_KEY = "endeavor_create_draft";

export type DraftData = {
  title: string;
  description: string;
  category: string;
  locationType: string;
  location: string;
  needs: string[];
  joinType: string;
  costPerPerson: string;
  capacity: string;
  fundingEnabled: boolean;
  fundingGoal: string;
  savedAt: number;
};

export function saveDraft(data: Omit<DraftData, "savedAt">) {
  try {
    const draft: DraftData = { ...data, savedAt: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

export function loadDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as DraftData;
    // Expire drafts older than 7 days
    if (Date.now() - draft.savedAt > 7 * 24 * 60 * 60 * 1000) {
      clearDraft();
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
