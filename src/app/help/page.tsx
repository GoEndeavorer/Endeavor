"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  id: string;
  label: string;
  items: FAQItem[];
}

const sections: FAQSection[] = [
  {
    id: "getting-started",
    label: "getting started",
    items: [
      {
        q: "What is Endeavor?",
        a: "Endeavor is a platform for people who want to do things together. Post what you want to do — a research project, an expedition, a creative collaboration, a community event — find people who want to do it with you, plan it, fund it, and make it happen.",
      },
      {
        q: "How do I create an endeavor?",
        a: "Click the \"Create\" button in the header or on your dashboard. Give your endeavor a title, description, category, and location type. You can set it as open join (anyone can join immediately) or request join (you approve each person). Once published, it's live and discoverable.",
      },
      {
        q: "How do I join an endeavor?",
        a: "Browse the feed, explore categories, or search by keyword to find endeavors that interest you. On the endeavor detail page, click \"Join\" to participate. If the endeavor uses request join, the creator will review your request and approve or decline it.",
      },
      {
        q: "Is Endeavor free to use?",
        a: "Yes. Creating an account, posting endeavors, and joining endeavors is completely free. Some endeavors may have a cost-to-join set by the creator, and there's optional crowdfunding for projects that need funding.",
      },
      {
        q: "What kinds of endeavors can I post?",
        a: "Anything collaborative — research projects, outdoor expeditions, open source software, documentaries, community workshops, cultural events, hackathons, and more. If you need people to make it happen, it belongs here.",
      },
    ],
  },
  {
    id: "collaboration",
    label: "collaboration",
    items: [
      {
        q: "How do discussions work?",
        a: "Each endeavor has a discussion space where members can post topics, share updates, ask questions, and comment on each other's posts. Discussions are visible to all members of the endeavor and keep everyone aligned.",
      },
      {
        q: "How do tasks work?",
        a: "Creators and members can create tasks within an endeavor. Tasks can be assigned to specific people, given due dates, and marked as complete. Use tasks to break down work and track progress toward your goals.",
      },
      {
        q: "What are milestones?",
        a: "Milestones are major checkpoints for your endeavor. They represent key goals or phases — like \"Secure permits\", \"Complete first draft\", or \"Launch day\". Tasks can be grouped under milestones to give structure to your project.",
      },
      {
        q: "Can I set roles for members?",
        a: "Yes. Creators can assign roles to members to clarify responsibilities. Roles help organize your crew and make it clear who's responsible for what.",
      },
    ],
  },
  {
    id: "communication",
    label: "communication",
    items: [
      {
        q: "How do direct messages work?",
        a: "You can send direct messages to any user on the platform from their profile page or from the messages section. Direct messages are private between you and the other person.",
      },
      {
        q: "Is there team chat for endeavors?",
        a: "Yes. Each endeavor has a built-in team chat where all members can communicate in real time. Use it for quick coordination, sharing links, or casual conversation alongside the more structured discussion board.",
      },
      {
        q: "What are polls?",
        a: "Polls let you gather input from your endeavor's members on decisions that need group consensus — like choosing a date, picking a location, or voting on a direction. Any member can create a poll within an endeavor.",
      },
      {
        q: "How do I get notified about activity?",
        a: "You'll receive notifications when someone joins your endeavor, posts in a discussion, completes a task, sends you a message, or mentions you. You can customize which notifications you receive in your settings.",
      },
    ],
  },
  {
    id: "funding",
    label: "funding",
    items: [
      {
        q: "What is cost-to-join?",
        a: "Cost-to-join is a per-person fee that creators can set for their endeavor. When someone joins, they pay that amount. This is useful for trips, expeditions, workshops, or events with shared expenses like equipment rental, permits, or venue costs.",
      },
      {
        q: "How does crowdfunding work?",
        a: "Creators can optionally enable crowdfunding with a goal amount. Anyone — members or non-members — can contribute. Payments are processed through Stripe. Funds go directly to the creator to use toward the endeavor.",
      },
      {
        q: "Can I use both cost-to-join and crowdfunding?",
        a: "Yes. You can set a cost-to-join for members and also enable crowdfunding to raise additional funds from supporters who may not be participating directly. The two mechanisms work independently.",
      },
      {
        q: "When do I get charged?",
        a: "For cost-to-join, you're charged when you join the endeavor. For crowdfunding contributions, you're charged immediately when you make your contribution. All payments are handled securely through Stripe.",
      },
      {
        q: "Can I get a refund?",
        a: "Refund policies are set by the endeavor creator. If you have questions about a specific payment, reach out to the creator directly through the endeavor's discussion or via direct message.",
      },
    ],
  },
  {
    id: "account",
    label: "account",
    items: [
      {
        q: "How do I set up my profile?",
        a: "Go to your profile page and click edit. Add a bio, your skills, your location, and a profile photo. A complete profile helps other people understand what you bring to an endeavor and increases your chances of being accepted into request-join endeavors.",
      },
      {
        q: "How do I change my settings?",
        a: "Visit the settings page from the navigation menu. You can update your email, password, notification preferences, privacy settings, and connected accounts.",
      },
      {
        q: "How do notifications work?",
        a: "Endeavor sends in-app notifications for activity related to your endeavors, messages, and follows. You can configure which notifications you receive and whether you also want email notifications in your settings.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. You can delete your account from the settings page. This will remove your profile and membership from all endeavors. Endeavors you created will remain but will be transferred to a co-creator or archived.",
      },
      {
        q: "How do I report a problem?",
        a: "Use the contact page to report bugs, policy violations, or other issues. You can also flag individual endeavors or users directly from their pages.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  function toggleItem(key: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Help", href: "/help" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Help & FAQ</h1>
        <p className="mb-12 text-lg text-light-gray leading-relaxed">
          Find answers to common questions about using Endeavor. Can&apos;t find
          what you&apos;re looking for? Reach out on the{" "}
          <a href="/contact" className="text-code-green hover:underline">
            contact page
          </a>
          .
        </p>

        {sections.map((section) => (
          <section key={section.id} className="mb-16">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// " + section.label}
            </h2>

            <div className="space-y-4">
              {section.items.map((faq, i) => {
                const key = `${section.id}-${i}`;
                const isOpen = openItems.has(key);

                return (
                  <div
                    key={key}
                    className={`border transition-colors ${
                      isOpen
                        ? "border-code-green/30"
                        : "border-medium-gray/20"
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full cursor-pointer px-5 py-4 text-sm font-semibold hover:text-code-green transition-colors flex items-center justify-between text-left"
                    >
                      {faq.q}
                      <span
                        className={`text-medium-gray text-lg flex-shrink-0 ml-4 transition-transform ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-light-gray leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
