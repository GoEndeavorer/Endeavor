import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Guides — Endeavor",
  description: "Learn how to create successful endeavors, build great teams, and make your projects happen.",
};

const guides = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Everything you need to know to create your first endeavor and start building your crew.",
    category: "Basics",
    readTime: "3 min",
    sections: [
      "Create a compelling title and description",
      "Choose the right category and location type",
      "Define what you need — skills, resources, funding",
      "Set up joining (open vs. request-based)",
      "Publish and share your endeavor",
    ],
  },
  {
    id: "building-a-team",
    title: "Building a Great Team",
    description: "How to attract the right people, evaluate join requests, and foster collaboration.",
    category: "Growth",
    readTime: "4 min",
    sections: [
      "Write needs that attract skilled people",
      "Use the hiring board to reach specialists",
      "Review join requests thoughtfully",
      "Set expectations early with milestones",
      "Use discussions to build rapport",
    ],
  },
  {
    id: "running-an-endeavor",
    title: "Running Your Endeavor",
    description: "Best practices for using the dashboard — tasks, milestones, updates, and keeping momentum.",
    category: "Management",
    readTime: "5 min",
    sections: [
      "Break work into tasks and assign them",
      "Set milestones to track progress",
      "Post regular updates to keep the team aligned",
      "Share links and resources in the links tab",
      "Use discussions for decisions and brainstorming",
    ],
  },
  {
    id: "crowdfunding",
    title: "Crowdfunding Your Project",
    description: "How to set a funding goal, attract backers, and manage your crowdfunding campaign.",
    category: "Funding",
    readTime: "4 min",
    sections: [
      "Decide between cost-to-join and crowdfunding",
      "Set a realistic funding goal",
      "Share your endeavor widely to attract backers",
      "Post updates about how funds will be used",
      "Thank your supporters publicly",
    ],
  },
  {
    id: "telling-your-story",
    title: "Telling Your Story",
    description: "How to write compelling stories about your endeavor experience — for yourself and the community.",
    category: "Stories",
    readTime: "3 min",
    sections: [
      "Reflect on what happened and what you learned",
      "Include specific details and moments",
      "Be honest about challenges and failures",
      "Credit your team and collaborators",
      "Publish to inspire future endeavors",
    ],
  },
  {
    id: "growing-your-profile",
    title: "Growing Your Profile",
    description: "Tips for building your reputation, earning badges, and becoming a recognized contributor.",
    category: "Growth",
    readTime: "3 min",
    sections: [
      "Complete your profile with bio, skills, and interests",
      "Join endeavors that match your skills",
      "Complete tasks and be reliable",
      "Write stories about your experiences",
      "Create endeavors of your own",
    ],
  },
];

const categoryColors: Record<string, string> = {
  Basics: "border-code-green text-code-green",
  Growth: "border-code-blue text-code-blue",
  Management: "border-yellow-400 text-yellow-400",
  Funding: "border-purple-400 text-purple-400",
  Stories: "border-orange-400 text-orange-400",
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Guides", href: "/guides" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Guides</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Learn how to get the most out of Endeavor — from creating your first project to building a thriving team.
        </p>

        <div className="space-y-6">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="border border-medium-gray/20 p-6 transition-colors hover:border-code-green/30"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className={`border px-2 py-0.5 text-xs uppercase ${categoryColors[guide.category] || "border-medium-gray text-medium-gray"}`}>
                  {guide.category}
                </span>
                <span className="text-xs text-medium-gray">{guide.readTime} read</span>
              </div>
              <h2 className="mb-2 text-lg font-semibold">{guide.title}</h2>
              <p className="mb-4 text-sm text-light-gray leading-relaxed">{guide.description}</p>
              <div className="space-y-1.5">
                {guide.sections.map((section, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-medium-gray">
                    <span className="mt-0.5 text-xs text-code-green shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-code-green/30 bg-code-green/5 p-8 text-center">
          <p className="text-lg font-semibold mb-2">Ready to start?</p>
          <p className="text-sm text-medium-gray mb-4">
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
