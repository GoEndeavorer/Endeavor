"use client";

import { useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

interface GuideStep {
  title: string;
  detail: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  steps: GuideStep[];
}

const guides: Guide[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "Everything you need to know to create your first endeavor and start building your crew.",
    category: "Basics",
    readTime: "4 min",
    steps: [
      {
        title: "Sign up and complete your profile",
        detail:
          "Create an account and fill out your profile with a bio, your skills, and your interests. A complete profile helps other people find you and builds trust when you create or join endeavors. Add a profile photo and link any relevant external profiles.",
      },
      {
        title: "Click \"Create\" to start a new endeavor",
        detail:
          "From the header or your dashboard, click the Create button. You'll be guided through the essential fields: title, description, category, and location type (in-person, remote, or hybrid). Take your time with the description — it's the first thing potential members will read.",
      },
      {
        title: "Write a compelling title and description",
        detail:
          "Your title should be specific and action-oriented. Instead of \"Photography Project\" try \"Document Street Art Across Downtown Before It's Painted Over.\" In the description, explain what you want to accomplish, why it matters, and what the experience will be like for members.",
      },
      {
        title: "Choose the right category and location type",
        detail:
          "Pick the category that best fits your endeavor — this helps people discover it through browse and search. Set your location type to in-person if you need people in a specific area, remote if anyone can participate from anywhere, or hybrid for a mix of both.",
      },
      {
        title: "Define what you need — skills, resources, funding",
        detail:
          "Use the Needs section to list exactly what your endeavor requires. Be specific: instead of \"someone good with cameras\" say \"videographer with experience in documentary-style interviews.\" You can list skill needs, equipment needs, and funding needs separately.",
      },
      {
        title: "Configure joining — open or request-based",
        detail:
          "Open join lets anyone join immediately, which is great for community events and large-scale projects. Request-based join means you review each person before they're added, which works better for smaller teams where chemistry and specific skills matter.",
      },
      {
        title: "Publish and share your endeavor",
        detail:
          "Once you're happy with everything, publish your endeavor. It will appear in the feed, in relevant category pages, and in search results. Share the link on your social channels, in relevant communities, and with people you think would be a good fit.",
      },
    ],
  },
  {
    id: "building-your-team",
    title: "Building Your Team",
    description:
      "How to attract the right people, evaluate join requests, and foster collaboration from day one.",
    category: "Growth",
    readTime: "5 min",
    steps: [
      {
        title: "Write needs that attract skilled people",
        detail:
          "Be specific about what roles you need filled. Describe the skills required, the time commitment expected, and what members will get out of the experience. People are more likely to join when they can clearly see how they fit into the project.",
      },
      {
        title: "Use the hiring board to reach specialists",
        detail:
          "Post open positions on the hiring board when you need people with specific expertise. Include the role title, required skills, expected time commitment, and whether the role is paid or volunteer. The hiring board reaches people actively looking for projects to join.",
      },
      {
        title: "Review join requests thoughtfully",
        detail:
          "When someone requests to join, check their profile — look at their skills, past endeavors, and stories. Send them a message through discussions to learn more about their interest and availability. A quick conversation goes a long way toward building a strong team.",
      },
      {
        title: "Set expectations early with milestones",
        detail:
          "Create milestones as soon as your team forms. This gives everyone a shared understanding of what you're working toward and by when. Break the project into phases so new members can see the roadmap and understand where the project stands.",
      },
      {
        title: "Use discussions to build rapport",
        detail:
          "Start a welcome thread where new members can introduce themselves. Use discussions for brainstorming, decision-making, and casual conversation. Teams that communicate openly tend to stay engaged longer and produce better work.",
      },
      {
        title: "Assign roles and responsibilities clearly",
        detail:
          "As your team grows, make sure everyone knows what they're responsible for. Use the task board to assign ownership of specific deliverables. When people have clear ownership, work moves faster and nothing falls through the cracks.",
      },
    ],
  },
  {
    id: "managing-tasks",
    title: "Managing Tasks",
    description:
      "How to use the task board to organize work, track progress, and keep your team moving forward.",
    category: "Management",
    readTime: "5 min",
    steps: [
      {
        title: "Create tasks for every piece of work",
        detail:
          "Break your project into individual tasks. Each task should represent a single, concrete piece of work that one person can complete. Good tasks have a clear definition of done — \"Write the introduction section\" is better than \"Work on the document.\"",
      },
      {
        title: "Use task statuses to track progress",
        detail:
          "Move tasks through statuses as work progresses: To Do, In Progress, and Done. This gives the whole team visibility into what's happening without needing to ask for updates. Check the board regularly to spot bottlenecks early.",
      },
      {
        title: "Assign tasks to specific team members",
        detail:
          "Every task should have an owner. Unassigned tasks tend to linger because everyone assumes someone else will handle them. When assigning tasks, consider each person's skills, availability, and current workload.",
      },
      {
        title: "Add details and context to each task",
        detail:
          "Include all relevant information in the task description: links to reference materials, specifications, deadlines, and any dependencies on other tasks. The goal is that someone can pick up a task and start working without needing to ask questions.",
      },
      {
        title: "Set milestones to group related tasks",
        detail:
          "Milestones bundle tasks into meaningful chunks — like project phases or sprint goals. They help you track overall progress and give the team a sense of accomplishment when a milestone is completed. Set target dates for each milestone to maintain momentum.",
      },
      {
        title: "Review and update the board regularly",
        detail:
          "Make it a habit to review the task board at least weekly. Archive completed tasks, update priorities, add new tasks as they emerge, and reassign anything that's stuck. A well-maintained board keeps the team aligned and focused.",
      },
    ],
  },
  {
    id: "crowdfunding",
    title: "Crowdfunding",
    description:
      "How to set a funding goal, attract backers, and manage your crowdfunding campaign effectively.",
    category: "Funding",
    readTime: "5 min",
    steps: [
      {
        title: "Decide between cost-to-join and crowdfunding",
        detail:
          "Cost-to-join charges each member a set fee when they join your endeavor — useful for workshops, classes, or events with per-person costs. Crowdfunding lets anyone contribute any amount toward a funding goal — ideal for projects that need capital for equipment, materials, or services.",
      },
      {
        title: "Set a realistic funding goal",
        detail:
          "Calculate exactly what you need and add a small buffer for unexpected costs. Break down your budget publicly so backers can see where their money goes. A transparent budget builds trust. Avoid inflating your goal — if you only need $500, don't ask for $2,000.",
      },
      {
        title: "Create a compelling pitch",
        detail:
          "Your endeavor description is your pitch to potential backers. Explain the project clearly, why it matters, and exactly what the funds will be used for. Include specific deliverables or outcomes that backers can look forward to. Show that your team has the skills to execute.",
      },
      {
        title: "Share your endeavor widely to attract backers",
        detail:
          "Post your endeavor link on social media, in relevant online communities, and through personal networks. Reach out to people who have supported similar projects before. The first 48 hours after launch are critical — momentum in early funding encourages others to contribute.",
      },
      {
        title: "Post regular updates about progress and fund usage",
        detail:
          "Keep your backers informed with regular updates. Share milestones reached, photos or videos of work in progress, and how funds are being spent. Backers who feel connected to the project are more likely to share it with others and support future endeavors.",
      },
      {
        title: "Thank your supporters publicly",
        detail:
          "Acknowledge your backers in updates, in your endeavor's story, and when the project is complete. Public gratitude builds community and makes people feel valued. Consider tagging supporters in milestone celebrations so they share in the achievement.",
      },
    ],
  },
  {
    id: "writing-stories",
    title: "Writing Stories",
    description:
      "How to share your journey with the community — from capturing moments to publishing a compelling narrative.",
    category: "Stories",
    readTime: "4 min",
    steps: [
      {
        title: "Start capturing moments early",
        detail:
          "Don't wait until your endeavor is over to start writing. Keep notes throughout the project — jot down key decisions, unexpected challenges, breakthrough moments, and funny anecdotes. These details are hard to remember later but they make stories come alive.",
      },
      {
        title: "Reflect on what happened and what you learned",
        detail:
          "Before writing, step back and think about the arc of your experience. What was the original vision? How did reality differ from expectations? What did you learn about the subject matter, about collaboration, about yourself? Stories with genuine reflection resonate most.",
      },
      {
        title: "Include specific details and moments",
        detail:
          "Generic summaries are forgettable. Instead of \"the team worked hard,\" describe the specific late-night session where someone had the breakthrough idea. Instead of \"we faced challenges,\" describe the exact moment something went wrong and how the team responded.",
      },
      {
        title: "Be honest about challenges and failures",
        detail:
          "The most valuable stories include what went wrong, not just what went right. Other endeavor creators can learn from your mistakes. Honesty about challenges also makes your successes more credible and your story more compelling to read.",
      },
      {
        title: "Credit your team and collaborators",
        detail:
          "Mention team members by name and highlight their contributions. Tag them in the story so it appears on their profiles too. Giving credit strengthens relationships and builds a culture of recognition within the Endeavor community.",
      },
      {
        title: "Publish and share to inspire others",
        detail:
          "When your story is ready, publish it on Endeavor. It will appear in the stories feed and on your profile. Share the link with your network — stories are one of the best ways to attract people to future endeavors because they show what the experience is actually like.",
      },
    ],
  },
  {
    id: "using-the-dashboard",
    title: "Using the Dashboard",
    description:
      "A complete walkthrough of your endeavor dashboard — every tab, feature, and setting explained.",
    category: "Management",
    readTime: "6 min",
    steps: [
      {
        title: "Overview tab — your endeavor at a glance",
        detail:
          "The overview tab shows your endeavor's description, current members, recent activity, and progress toward milestones. Use it to quickly assess the state of the project. As the creator, this is also where you'll see pending join requests and recent discussion activity.",
      },
      {
        title: "Tasks tab — organize and track work",
        detail:
          "The tasks tab is your project's task board. Create tasks, assign them to members, set priorities, and track progress through status columns. Filter tasks by assignee, status, or milestone to focus on what matters right now.",
      },
      {
        title: "Discussions tab — communicate with your team",
        detail:
          "Start threads for different topics — planning, brainstorming, questions, announcements. Discussions keep conversations organized and searchable, unlike chat messages that scroll away. Pin important threads so they're always easy to find.",
      },
      {
        title: "Members tab — manage your crew",
        detail:
          "View all current members, their roles, and their join dates. As the creator, you can manage permissions, approve or decline join requests, and remove members if needed. A healthy members tab shows an active, engaged team.",
      },
      {
        title: "Links tab — share resources",
        detail:
          "Add links to external resources your team needs: documents, design files, reference articles, tools, shared drives. The links tab keeps everything in one place so team members don't have to dig through old messages to find that one URL.",
      },
      {
        title: "Settings tab — configure your endeavor",
        detail:
          "Update your endeavor's title, description, category, location, and join settings anytime. You can also configure crowdfunding options, set cost-to-join, archive the endeavor when it's complete, or transfer ownership to another member.",
      },
      {
        title: "Updates tab — keep everyone informed",
        detail:
          "Post updates to share progress with your team and followers. Updates appear in members' activity feeds and can be shared externally. Regular updates keep momentum going and show potential joiners that the project is active and making progress.",
      },
    ],
  },
  {
    id: "community-features",
    title: "Community Features",
    description:
      "How to use discussions, endorsements, reviews, and other community tools to build connections.",
    category: "Community",
    readTime: "5 min",
    steps: [
      {
        title: "Participate in discussions to build reputation",
        detail:
          "Join discussions on endeavors you're interested in, even ones you haven't joined. Thoughtful comments and helpful suggestions demonstrate your expertise and make creators want you on their team. The community notices people who contribute constructively.",
      },
      {
        title: "Endorse people you've worked with",
        detail:
          "After collaborating on an endeavor, endorse your teammates' skills. Endorsements appear on their profiles and help them get accepted to future endeavors. Be genuine — only endorse skills you've actually witnessed in action. Quality endorsements carry more weight.",
      },
      {
        title: "Leave reviews on completed endeavors",
        detail:
          "When an endeavor wraps up, leave an honest review about the experience. Talk about the organization, the teamwork, the outcome, and what you learned. Reviews help future members decide which endeavors to join and help creators improve their approach.",
      },
      {
        title: "Follow people and endeavors that interest you",
        detail:
          "Follow creators whose work inspires you and endeavors you want to track. You'll see their updates in your activity feed. Following is also a low-commitment way to stay connected to projects you might want to join later.",
      },
      {
        title: "Explore tags and categories to discover new projects",
        detail:
          "Browse by category to find endeavors in your areas of interest, or follow specific tags to get notified about new projects that match your skills. The explore page and trending section surface active endeavors that might be a perfect fit.",
      },
      {
        title: "Contribute to the community beyond your own endeavors",
        detail:
          "Share knowledge in discussions, write stories about your experiences, endorse good collaborators, and help newcomers get started. The strongest communities are built by people who give more than they take. Your contributions compound over time.",
      },
    ],
  },
  {
    id: "tips-for-success",
    title: "Tips for Success",
    description:
      "Best practices for running an endeavor — from launch to completion and beyond.",
    category: "Best Practices",
    readTime: "5 min",
    steps: [
      {
        title: "Start small, then scale",
        detail:
          "Your first endeavor doesn't need to be massive. Start with something achievable with 2-5 people. Completing a small project successfully teaches you the platform, builds your reputation, and gives you a story to share. Scale up from a position of experience.",
      },
      {
        title: "Communicate early and often",
        detail:
          "Most endeavors that fail do so because of communication breakdowns, not lack of skill. Post updates at least weekly, respond to discussions promptly, and reach out directly to team members who go quiet. Over-communication beats silence every time.",
      },
      {
        title: "Set clear deadlines and stick to them",
        detail:
          "Projects without deadlines drift indefinitely. Set milestone dates and hold yourself and your team accountable. If a deadline needs to move, communicate the change and the reason. Deadlines create urgency and help teams prioritize.",
      },
      {
        title: "Be responsive to join requests",
        detail:
          "When someone requests to join your endeavor, respond within 24-48 hours. Quick responses show that the project is active and well-managed. A request left unanswered for a week tells potential members that the endeavor might be abandoned.",
      },
      {
        title: "Celebrate progress along the way",
        detail:
          "Don't wait until the project is 100% complete to celebrate. Mark milestones, acknowledge great work, and share wins in your updates. Celebrations boost morale and keep the team motivated through the inevitable tough stretches.",
      },
      {
        title: "Document everything for your story",
        detail:
          "Keep a running log of key moments, decisions, challenges, and outcomes. Take photos and screenshots. This documentation makes it easy to write a compelling story when the endeavor is complete, and it serves as a valuable reference for future projects.",
      },
      {
        title: "Learn from completed endeavors",
        detail:
          "After your endeavor wraps up, reflect on what worked and what didn't. Read your reviews, talk to your team, and note what you'd do differently. Each endeavor makes you a better creator and collaborator. Share your lessons in a story to help others too.",
      },
    ],
  },
];

const categoryColors: Record<string, string> = {
  Basics: "border-code-green text-code-green",
  Growth: "border-code-blue text-code-blue",
  Management: "border-yellow-400 text-yellow-400",
  Funding: "border-purple-400 text-purple-400",
  Stories: "border-orange-400 text-orange-400",
  Community: "border-cyan-400 text-cyan-400",
  "Best Practices": "border-emerald-400 text-emerald-400",
};

function GuideSection({ guide }: { guide: Guide }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-medium-gray/20 transition-colors hover:border-code-green/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full cursor-pointer p-6 text-left"
      >
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`border px-2 py-0.5 text-xs uppercase ${categoryColors[guide.category] || "border-medium-gray text-medium-gray"}`}
          >
            {guide.category}
          </span>
          <span className="text-xs text-medium-gray">
            {guide.readTime} read
          </span>
          <span className="ml-auto text-xs text-medium-gray">
            {open ? "collapse" : "expand"}
          </span>
        </div>
        <h2 className="mb-2 text-lg font-semibold">{guide.title}</h2>
        <p className="text-sm leading-relaxed text-light-gray">
          {guide.description}
        </p>
      </button>

      {open && (
        <div className="border-t border-medium-gray/20 px-6 pt-4 pb-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// step-by-step"}
          </p>
          <div className="space-y-4">
            {guide.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-xs font-mono text-code-green">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-medium-gray">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuidesPage() {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Guides", href: "/guides" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// guides"}
        </p>
        <h1 className="mb-2 text-3xl font-bold">Guides</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Learn how to get the most out of Endeavor — from creating your first
          project to building a thriving team.
        </p>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-medium-gray">
            {guides.length} guides available
          </p>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="cursor-pointer text-xs text-code-blue transition-colors hover:text-code-green"
          >
            {expandAll ? "collapse all" : "expand all"}
          </button>
        </div>

        <div className="space-y-4">
          {guides.map((guide) =>
            expandAll ? (
              <GuideExpandedSection key={guide.id} guide={guide} />
            ) : (
              <GuideSection key={guide.id} guide={guide} />
            ),
          )}
        </div>

        <div className="mt-12 border border-code-green/30 bg-code-green/5 p-8 text-center">
          <p className="mb-2 text-lg font-semibold">Ready to start?</p>
          <p className="mb-4 text-sm text-medium-gray">
            Put these guides into practice by creating your first endeavor.
          </p>
          <Link
            href="/endeavors/create"
            className="inline-block border border-code-green bg-code-green px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
          >
            Create an Endeavor
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function GuideExpandedSection({ guide }: { guide: Guide }) {
  return (
    <div className="border border-medium-gray/20 transition-colors hover:border-code-green/30">
      <div className="p-6">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`border px-2 py-0.5 text-xs uppercase ${categoryColors[guide.category] || "border-medium-gray text-medium-gray"}`}
          >
            {guide.category}
          </span>
          <span className="text-xs text-medium-gray">
            {guide.readTime} read
          </span>
        </div>
        <h2 className="mb-2 text-lg font-semibold">{guide.title}</h2>
        <p className="text-sm leading-relaxed text-light-gray">
          {guide.description}
        </p>
      </div>
      <div className="border-t border-medium-gray/20 px-6 pt-4 pb-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// step-by-step"}
        </p>
        <div className="space-y-4">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <span className="mt-0.5 shrink-0 text-xs font-mono text-code-green">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-medium-gray">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
