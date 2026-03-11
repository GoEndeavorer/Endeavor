"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  rarity: Rarity;
  category: string;
  earned: boolean;
};

const RARITY_COLORS: Record<Rarity, string> = {
  common: "text-medium-gray border-medium-gray/40",
  uncommon: "text-code-green border-code-green/40",
  rare: "text-code-blue border-code-blue/40",
  epic: "text-purple-400 border-purple-400/40",
  legendary: "text-yellow-400 border-yellow-400/40",
};

const RARITY_BG: Record<Rarity, string> = {
  common: "bg-medium-gray/10",
  uncommon: "bg-code-green/10",
  rare: "bg-code-blue/10",
  epic: "bg-purple-400/10",
  legendary: "bg-yellow-400/10",
};

const RARITY_GLOW: Record<Rarity, string> = {
  common: "",
  uncommon: "",
  rare: "",
  epic: "shadow-[0_0_12px_rgba(168,85,247,0.15)]",
  legendary: "shadow-[0_0_16px_rgba(250,204,21,0.2)]",
};

const RARITY_LABEL_BG: Record<Rarity, string> = {
  common: "bg-medium-gray/20 text-medium-gray",
  uncommon: "bg-code-green/15 text-code-green",
  rare: "bg-code-blue/15 text-code-blue",
  epic: "bg-purple-400/15 text-purple-400",
  legendary: "bg-yellow-400/15 text-yellow-400",
};

const ALL_BADGES: Badge[] = [
  // Community
  { id: "first-login", name: "First Steps", description: "Log in for the first time", icon: "\u{1F44B}", criteria: "Log in to Endeavor for the very first time.", rarity: "common", category: "community", earned: true },
  { id: "profile-complete", name: "Identity", description: "Complete your profile", icon: "\u{1F3AD}", criteria: "Fill out all profile fields including bio, avatar, and links.", rarity: "common", category: "community", earned: true },
  { id: "first-follow", name: "Networker", description: "Follow another user", icon: "\u{1F517}", criteria: "Follow at least one other user on the platform.", rarity: "common", category: "community", earned: true },
  { id: "ten-followers", name: "Rising Star", description: "Gain 10 followers", icon: "\u2B50", criteria: "Have at least 10 users following your profile.", rarity: "uncommon", category: "community", earned: false },
  { id: "fifty-followers", name: "Influencer", description: "Gain 50 followers", icon: "\u{1F451}", criteria: "Have at least 50 users following your profile.", rarity: "rare", category: "community", earned: false },
  // Contribution
  { id: "first-endeavor", name: "Spark", description: "Create your first endeavor", icon: "\u26A1", criteria: "Create and publish your first endeavor on the platform.", rarity: "common", category: "contribution", earned: true },
  { id: "five-endeavors", name: "Prolific", description: "Create 5 endeavors", icon: "\u{1F680}", criteria: "Create and publish at least 5 endeavors.", rarity: "uncommon", category: "contribution", earned: false },
  { id: "first-collab", name: "Team Player", description: "Join an endeavor as a collaborator", icon: "\u{1F91D}", criteria: "Be accepted as a collaborator on another user's endeavor.", rarity: "common", category: "contribution", earned: true },
  { id: "ten-collabs", name: "Bridge Builder", description: "Collaborate on 10 endeavors", icon: "\u{1F309}", criteria: "Be a collaborator on at least 10 different endeavors.", rarity: "rare", category: "contribution", earned: false },
  { id: "first-story", name: "Storyteller", description: "Publish your first story", icon: "\u{1F4DD}", criteria: "Write and publish a story or update on an endeavor.", rarity: "common", category: "contribution", earned: false },
  // Milestone
  { id: "week-streak", name: "Consistent", description: "7-day activity streak", icon: "\u{1F525}", criteria: "Log activity on the platform for 7 consecutive days.", rarity: "uncommon", category: "milestone", earned: false },
  { id: "month-streak", name: "Dedicated", description: "30-day activity streak", icon: "\u{1F4AA}", criteria: "Log activity on the platform for 30 consecutive days.", rarity: "rare", category: "milestone", earned: false },
  { id: "hundred-streak", name: "Unstoppable", description: "100-day activity streak", icon: "\u{1F3C6}", criteria: "Log activity on the platform for 100 consecutive days.", rarity: "epic", category: "milestone", earned: false },
  { id: "level-ten", name: "Double Digits", description: "Reach level 10", icon: "\u{1F4CA}", criteria: "Accumulate enough XP to reach level 10.", rarity: "uncommon", category: "milestone", earned: false },
  { id: "level-fifty", name: "Veteran", description: "Reach level 50", icon: "\u{1F396}\uFE0F", criteria: "Accumulate enough XP to reach level 50.", rarity: "legendary", category: "milestone", earned: false },
  // Skill
  { id: "first-endorsement", name: "Endorsed", description: "Receive your first endorsement", icon: "\u{1F44D}", criteria: "Have another user endorse one of your skills.", rarity: "common", category: "skill", earned: false },
  { id: "ten-endorsements", name: "Respected", description: "Receive 10 endorsements", icon: "\u{1F48E}", criteria: "Accumulate at least 10 skill endorsements from other users.", rarity: "rare", category: "skill", earned: false },
  { id: "five-skills", name: "Versatile", description: "Add 5 skills to your profile", icon: "\u{1F9E9}", criteria: "List at least 5 distinct skills on your profile.", rarity: "uncommon", category: "skill", earned: false },
  // Special
  { id: "early-adopter", name: "Early Adopter", description: "Joined during beta", icon: "\u{1F331}", criteria: "Create an account during the Endeavor beta period.", rarity: "epic", category: "special", earned: true },
  { id: "founding-member", name: "Founding Member", description: "One of the first 100 users", icon: "\u{1F3DB}\uFE0F", criteria: "Be among the first 100 users to register on Endeavor.", rarity: "legendary", category: "special", earned: true },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "community", label: "Community" },
  { key: "contribution", label: "Contribution" },
  { key: "milestone", label: "Milestone" },
  { key: "skill", label: "Skill" },
  { key: "special", label: "Special" },
];

const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

const RARITY_FILTERS: { key: Rarity | "all"; label: string }[] = [
  { key: "all", label: "All Rarities" },
  { key: "common", label: "Common" },
  { key: "uncommon", label: "Uncommon" },
  { key: "rare", label: "Rare" },
  { key: "epic", label: "Epic" },
  { key: "legendary", label: "Legendary" },
];

export default function BadgesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRarity, setActiveRarity] = useState<Rarity | "all">("all");
  const [showEarned, setShowEarned] = useState<"all" | "earned" | "locked">("all");

  const earnedCount = ALL_BADGES.filter((b) => b.earned).length;
  const totalCount = ALL_BADGES.length;
  const progressPct = Math.round((earnedCount / totalCount) * 100);

  const filtered = ALL_BADGES.filter((b) => {
    if (activeCategory !== "all" && b.category !== activeCategory) return false;
    if (activeRarity !== "all" && b.rarity !== activeRarity) return false;
    if (showEarned === "earned" && !b.earned) return false;
    if (showEarned === "locked" && b.earned) return false;
    return true;
  }).sort((a, b) => {
    // Earned first, then by rarity (legendary first)
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity);
  });

  function handleBadgeClick(badge: Badge) {
    if (badge.earned) {
      toast(`${badge.icon} ${badge.name} -- earned!`);
    } else {
      toast(`${badge.name}: ${badge.criteria}`, "info");
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <AppHeader breadcrumb={{ label: "Badges", href: "/badges" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {/* Header */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// badges"}
        </p>
        <h1 className="mb-2 text-3xl font-bold">Badges Showcase</h1>
        <p className="mb-6 text-sm text-medium-gray">
          Collect badges by completing challenges, contributing to endeavors,
          and reaching milestones across the platform.
        </p>

        {/* Progress summary */}
        <div className="mb-8 border border-medium-gray/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// collection progress"}
              </p>
              <p className="mt-1 text-sm text-medium-gray">
                <span className="font-mono text-lg font-bold text-white">
                  {earnedCount}
                </span>{" "}
                / {totalCount} badges earned
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-bold text-code-green">
                {progressPct}%
              </p>
              <p className="text-[10px] uppercase tracking-wide text-medium-gray">
                Complete
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full bg-medium-gray/20">
            <div
              className="h-2 bg-code-green transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Rarity legend */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// rarity"}
          </p>
          <div className="flex flex-wrap gap-2">
            {RARITY_ORDER.map((r) => (
              <span
                key={r}
                className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${RARITY_LABEL_BG[r]}`}
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-code-green bg-code-green/10 text-code-green"
                    : "border-medium-gray/20 text-medium-gray hover:border-medium-gray/40"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Rarity + earned filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {RARITY_FILTERS.map((rf) => {
            const isActive = activeRarity === rf.key;
            return (
              <button
                key={rf.key}
                onClick={() => setActiveRarity(rf.key)}
                className={`border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-code-blue bg-code-blue/10 text-code-blue"
                    : "border-medium-gray/20 text-medium-gray hover:border-medium-gray/40"
                }`}
              >
                {rf.label}
              </button>
            );
          })}
          <span className="mx-2 text-medium-gray/30">|</span>
          {(["all", "earned", "locked"] as const).map((s) => {
            const label = s === "all" ? "All" : s === "earned" ? "Earned" : "Locked";
            const isActive = showEarned === s;
            return (
              <button
                key={s}
                onClick={() => setShowEarned(s)}
                className={`border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-code-blue bg-code-blue/10 text-code-blue"
                    : "border-medium-gray/20 text-medium-gray hover:border-medium-gray/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Badge grid */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// showing"} {filtered.length} badge{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-medium-gray">
            No badges match the selected filters.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((badge) => (
              <button
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`group relative border p-4 text-left transition-all hover:border-code-green/50 ${
                  badge.earned
                    ? `${RARITY_COLORS[badge.rarity]} ${RARITY_GLOW[badge.rarity]}`
                    : "border-medium-gray/15 opacity-50 grayscale hover:opacity-75 hover:grayscale-0"
                }`}
              >
                {/* Rarity indicator */}
                <span
                  className={`absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${RARITY_LABEL_BG[badge.rarity]}`}
                >
                  {badge.rarity}
                </span>

                {/* Icon */}
                <div
                  className={`mb-3 flex h-12 w-12 items-center justify-center text-2xl ${
                    badge.earned ? RARITY_BG[badge.rarity] : "bg-medium-gray/10"
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-light-gray group-hover:text-white">
                  {badge.name}
                </h3>

                {/* Description */}
                <p className="mt-0.5 text-xs text-medium-gray">
                  {badge.description}
                </p>

                {/* Criteria */}
                <p className="mt-2 text-[10px] leading-relaxed text-medium-gray/70">
                  {badge.criteria}
                </p>

                {/* Earned indicator */}
                {badge.earned && (
                  <div className="mt-3 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-code-green" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-code-green">
                      Earned
                    </span>
                  </div>
                )}

                {!badge.earned && (
                  <div className="mt-3 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-medium-gray/40" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-medium-gray/50">
                      Locked
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Stats summary */}
        <div className="mt-12 border-t border-medium-gray/20 pt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// collection stats"}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {RARITY_ORDER.map((r) => {
              const total = ALL_BADGES.filter((b) => b.rarity === r).length;
              const earned = ALL_BADGES.filter((b) => b.rarity === r && b.earned).length;
              return (
                <div key={r} className="border border-medium-gray/20 p-3">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      RARITY_COLORS[r].split(" ")[0]
                    }`}
                  >
                    {r}
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-white">
                    {earned}
                    <span className="text-sm text-medium-gray">/{total}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
