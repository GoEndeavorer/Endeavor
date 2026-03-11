// Analytics helper — plug in your preferred analytics service
// Currently logs to console in development, no-op in production
// Replace with PostHog, Plausible, Vercel Analytics, etc.

type EventProperties = Record<string, string | number | boolean>;

export function trackEvent(name: string, properties?: EventProperties) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${name}`, properties || "");
  }

  // TODO: Send to analytics service
  // Example with Vercel Analytics:
  // if (typeof window !== "undefined" && window.va) {
  //   window.va("event", { name, ...properties });
  // }
}

export function trackPageView(path: string) {
  trackEvent("page_view", { path });
}
