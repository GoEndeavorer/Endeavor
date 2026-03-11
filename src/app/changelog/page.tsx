import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Changelog — Endeavor",
  description: "What's new on Endeavor. A history of features, improvements, and updates.",
};

const releases = [
  {
    version: "0.15.0",
    date: "March 2026",
    title: "Achievements & Polish",
    items: [
      "User badges and achievements system — earn badges for creating, joining, and contributing",
      "About & FAQ page with platform principles",
      "Featured stories on the landing page",
      "Notification bell improvements — polling, type icons, relative timestamps, unread indicators",
      "Leaderboard and Stories added to navigation",
      "Changelog page (you're reading it!)",
    ],
  },
  {
    version: "0.14.0",
    date: "March 2026",
    title: "Image Picker & Refinements",
    items: [
      "Image picker with curated stock images per category",
      "Improved CTA section with trust indicators",
      "Privacy policy and terms of service pages",
      "Keyboard shortcuts (? for help, H/F/N/P/S for navigation)",
      "Scroll-to-top button",
      "Explore/trending page with community insights",
      "Endeavor creation templates (6 quick-start options)",
      "Change password in settings",
    ],
  },
  {
    version: "0.13.0",
    date: "March 2026",
    title: "Stories & Discovery",
    items: [
      "Stories hub — browse all published stories across the platform",
      "Individual story pages with full OG metadata",
      "RSS feed for endeavors",
      "JSON-LD structured data for search engines",
      "PWA manifest for installability",
    ],
  },
  {
    version: "0.12.0",
    date: "March 2026",
    title: "Search & People",
    items: [
      "Dedicated search results page with tabbed filtering",
      "People directory with skill-based discovery",
      "Password reset flow with secure token-based email",
      "Enhanced OG metadata for social sharing",
      "User profile page improvements",
    ],
  },
  {
    version: "0.11.0",
    date: "March 2026",
    title: "Platform Maturity",
    items: [
      "Who's Hiring page — find endeavors that need your skills",
      "Leaderboard with top creators, contributors, and most active users",
      "Recently viewed endeavors tracking",
      "Form completion progress indicator",
      "Loading skeletons across all pages",
      "Footer navigation improvements",
    ],
  },
  {
    version: "0.10.0",
    date: "March 2026",
    title: "Community Features",
    items: [
      "Activity feed showing platform-wide events",
      "User following system",
      "Bookmarks and saved endeavors",
      "Notification system with bell and full page",
      "Admin dashboard",
    ],
  },
  {
    version: "0.9.0",
    date: "March 2026",
    title: "Dashboard & Collaboration",
    items: [
      "Endeavor dashboard with discussions, tasks, milestones, stories, links",
      "Creator announcements (updates) with pinning",
      "Member management with approve/reject for request-based joining",
      "Milestone tracking with completion dates",
      "Shared links and resources",
    ],
  },
  {
    version: "0.8.0",
    date: "March 2026",
    title: "Payments & Growth",
    items: [
      "Stripe integration for cost-to-join payments",
      "Crowdfunding with funding goals and progress tracking",
      "Similar endeavors recommendations",
      "Report/flag system for moderation",
      "Endeavor duplication (use as template)",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Changelog", href: "/changelog" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Changelog</h1>
        <p className="mb-10 text-sm text-medium-gray">
          A history of what&apos;s been built on Endeavor.
        </p>

        <div className="space-y-12">
          {releases.map((release) => (
            <div key={release.version} className="relative pl-6 border-l-2 border-medium-gray/20">
              <div className="absolute -left-[5px] top-0 h-2 w-2 bg-code-green" />
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-sm font-bold text-code-green">
                  v{release.version}
                </span>
                <span className="text-xs text-medium-gray">{release.date}</span>
              </div>
              <h2 className="mb-3 text-lg font-semibold">{release.title}</h2>
              <ul className="space-y-1.5">
                {release.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-light-gray">
                    <span className="mt-1 text-code-green text-xs shrink-0">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
