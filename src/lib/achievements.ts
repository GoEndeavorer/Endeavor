export type AchievementDef = {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // Creation
  { key: "first_endeavor", title: "Spark", description: "Created your first endeavor", icon: "*", color: "text-yellow-400", tier: "bronze" },
  { key: "five_endeavors", title: "Visionary", description: "Created 5 endeavors", icon: "*", color: "text-code-blue", tier: "silver" },
  { key: "ten_endeavors", title: "Architect", description: "Created 10 endeavors", icon: "*", color: "text-purple-400", tier: "gold" },

  // Participation
  { key: "first_join", title: "Team Player", description: "Joined your first endeavor", icon: "+", color: "text-code-green", tier: "bronze" },
  { key: "five_joins", title: "Collaborator", description: "Joined 5 endeavors", icon: "+", color: "text-code-blue", tier: "silver" },
  { key: "ten_joins", title: "Adventurer", description: "Joined 10 endeavors", icon: "+", color: "text-purple-400", tier: "gold" },

  // Tasks
  { key: "first_task", title: "Doer", description: "Completed your first task", icon: "#", color: "text-code-green", tier: "bronze" },
  { key: "ten_tasks", title: "Workhorse", description: "Completed 10 tasks", icon: "#", color: "text-code-blue", tier: "silver" },
  { key: "fifty_tasks", title: "Machine", description: "Completed 50 tasks", icon: "#", color: "text-yellow-400", tier: "gold" },
  { key: "hundred_tasks", title: "Unstoppable", description: "Completed 100 tasks", icon: "#", color: "text-purple-400", tier: "platinum" },

  // Discussions
  { key: "first_post", title: "Speaker", description: "Posted your first discussion message", icon: "~", color: "text-code-green", tier: "bronze" },
  { key: "fifty_posts", title: "Conversationalist", description: "Posted 50 discussion messages", icon: "~", color: "text-code-blue", tier: "silver" },
  { key: "hundred_posts", title: "Orator", description: "Posted 100 discussion messages", icon: "~", color: "text-yellow-400", tier: "gold" },

  // Stories
  { key: "first_story", title: "Storyteller", description: "Published your first story", icon: "$", color: "text-code-green", tier: "bronze" },
  { key: "five_stories", title: "Chronicler", description: "Published 5 stories", icon: "$", color: "text-code-blue", tier: "silver" },

  // Social
  { key: "first_endorsement", title: "Supporter", description: "Gave your first endorsement", icon: "^", color: "text-code-green", tier: "bronze" },
  { key: "ten_endorsements_received", title: "Respected", description: "Received 10 endorsements", icon: "^", color: "text-yellow-400", tier: "gold" },

  // Milestones
  { key: "first_milestone", title: "Milestone Maker", description: "Completed your first milestone", icon: "!", color: "text-code-green", tier: "bronze" },

  // Special
  { key: "completed_endeavor", title: "Finisher", description: "Completed an endeavor you created", icon: ">", color: "text-yellow-400", tier: "gold" },
  { key: "seven_day_streak", title: "On Fire", description: "Active for 7 consecutive days", icon: "~", color: "text-orange-400", tier: "silver" },
  { key: "profile_complete", title: "Identity", description: "Filled out your complete profile", icon: "@", color: "text-code-blue", tier: "bronze" },
];

export function getAchievement(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}

const TIER_ORDER = { bronze: 0, silver: 1, gold: 2, platinum: 3 };

export function sortByTier(achievements: AchievementDef[]): AchievementDef[] {
  return [...achievements].sort((a, b) => TIER_ORDER[b.tier] - TIER_ORDER[a.tier]);
}
