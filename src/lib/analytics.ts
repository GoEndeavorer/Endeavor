// Analytics helper — plug in your preferred analytics service
// Logs to console in development; add Vercel Analytics, PostHog, etc.

type EventProperties = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, properties?: EventProperties) {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${name}`, properties || "");
  }

  // Vercel Analytics (if @vercel/analytics is installed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.va) {
    w.va("event", { name, ...properties });
  }
}

// Predefined events for type safety
export const analytics = {
  endeavorCreated: (id: string, category: string) =>
    trackEvent("endeavor_created", { endeavor_id: id, category }),

  endeavorJoined: (id: string, method: "open" | "request") =>
    trackEvent("endeavor_joined", { endeavor_id: id, method }),

  endeavorViewed: (id: string, category: string) =>
    trackEvent("endeavor_viewed", { endeavor_id: id, category }),

  checkoutStarted: (id: string, type: "join" | "donation", amount: number) =>
    trackEvent("checkout_started", { endeavor_id: id, type, amount }),

  taskCreated: (endeavorId: string) =>
    trackEvent("task_created", { endeavor_id: endeavorId }),

  milestoneCompleted: (endeavorId: string) =>
    trackEvent("milestone_completed", { endeavor_id: endeavorId }),

  storyPublished: (endeavorId: string) =>
    trackEvent("story_published", { endeavor_id: endeavorId }),

  searchPerformed: (query: string, category?: string) =>
    trackEvent("search_performed", { query, category }),

  signUp: () => trackEvent("sign_up"),
  signIn: () => trackEvent("sign_in"),
};
