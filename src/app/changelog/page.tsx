import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Changelog — Endeavor",
  description: "What's new on Endeavor. A history of features, improvements, and updates.",
};

const releases = [
  {
    version: "0.19.0",
    date: "March 2026",
    title: "Collections & Growth",
    items: [
      "Bookmark collections — organize saved endeavors into named, shareable lists",
      "Endeavor analytics — creator dashboard with member growth, discussion activity, task breakdown, and top contributors",
      "Enhanced invite links — trackable links with expiry, max uses, and view counts",
      "Report system — flag endeavors, users, discussions, or stories with categorized reasons",
      "Weekly digest emails — automated summaries of activity across your endeavors via Resend",
      "User onboarding flow — step-by-step guide for new users",
      "Feed sidebar — most active endeavors, skills in demand, and quick links",
      "MiniStats widget on landing page",
      "Compare API now uses parameterized SQL for safety",
      "Activity heatmap component for user profiles",
      "Collections page with create, edit, and public/private toggle",
      "Admin reports dashboard updated with new moderation schema",
    ],
  },
  {
    version: "0.18.0",
    date: "March 2026",
    title: "Discovery & UX",
    items: [
      "For You feed — personalized endeavor recommendations based on interests and follows",
      "Batch notification management — select, mark read, and delete multiple at once",
      "Endeavor timeline — chronological view of all events, members, tasks, and milestones",
      "Enhanced search — now includes stories and discussion results with tabbed navigation",
      "Keyboard shortcuts upgraded — 'g' prefix navigation (g+f for feed, g+d for dashboard, etc.)",
      "Timeline API — unified chronological event stream from all endeavor activity",
      "Invite link system — shareable codes for team onboarding",
      "Notification types expanded — DM notifications with @ icon",
      "Skeleton loading states for notifications",
    ],
  },
  {
    version: "0.17.0",
    date: "March 2026",
    title: "Communication & Insights",
    items: [
      "Direct messages — private conversations between users",
      "Endorsements — member testimonials with 1-5 star ratings on endeavors",
      "Creator insights dashboard — analytics, growth charts, top contributors",
      "Media gallery — image grid and file attachments per endeavor",
      "Weekly digest — personalized 7-day summary of activity",
      "Member directory page with search for each endeavor",
      "Endeavor compare — side-by-side comparison of up to 3 endeavors",
      "Help center — FAQ with expandable accordion sections",
      "Data export — download all your data as JSON",
      "Progress tracker bars for milestones, tasks, team, and funding",
      "Activity feed API aggregating all endeavor events",
      "Endeavor clone/duplicate API for quick project replication",
      "Grid/List view toggle on explore feed",
      "Most Funded sort option",
      "Member role management and self-leave with notifications",
      "DM notifications and settings preference",
    ],
  },
  {
    version: "0.16.0",
    date: "March 2026",
    title: "Collaboration & Discovery",
    items: [
      "Team chat — real-time messaging within endeavor groups",
      "Polls — create and vote on decisions with your team",
      "Calendar view — see upcoming tasks and milestones across all your endeavors",
      "Location map — explore endeavors grouped by location",
      "Personal dashboard with analytics and quick actions",
      "Shareable invite links for seamless team onboarding",
      "Project templates — 8 pre-built templates for common endeavor types",
      "Discussion reactions — like, heart, fire, celebrate on posts",
      "Social links — website, GitHub, Twitter, LinkedIn on profiles",
      "Spotlight section on landing page featuring most active endeavor",
      "Discover page aggregating recommendations, trending, and new projects",
      "Tags browser with tag cloud visualization",
      "Missing SEO layouts and loading skeletons for all pages",
    ],
  },
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
