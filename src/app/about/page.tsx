import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { CTA } from "@/components/cta";

export const metadata = {
  title: "About — Endeavor",
  description: "Learn about the Endeavor platform — how it works, our mission, and frequently asked questions.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "About", href: "/about" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">About Endeavor</h1>
        <p className="mb-12 text-lg text-light-gray leading-relaxed">
          Endeavor is a platform for people who want to do things together. Post
          what you want to do, find people who want to do it with you, plan it,
          fund it, make it happen.
        </p>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// how it works"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Post your endeavor",
                desc: "Describe what you want to do — a research project, an expedition, a creative collaboration, a community event.",
              },
              {
                step: "02",
                title: "Build your crew",
                desc: "People discover your endeavor and join. Specify what skills you need and let the right people find you.",
              },
              {
                step: "03",
                title: "Make it happen",
                desc: "Use the dashboard to coordinate tasks, milestones, discussions, and shared resources. Tell the story when you're done.",
              },
            ].map((item) => (
              <div key={item.step} className="border border-medium-gray/20 p-6">
                <span className="text-3xl font-bold text-code-green/30">
                  {item.step}
                </span>
                <h3 className="mt-3 mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-medium-gray leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// faq"}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is Endeavor free to use?",
                a: "Yes. Creating an account and posting endeavors is completely free. Some endeavors may have a cost-to-join set by the creator, and there's optional crowdfunding for projects that need funding.",
              },
              {
                q: "What kinds of endeavors can I post?",
                a: "Anything collaborative — research projects, outdoor expeditions, open source software, documentaries, community workshops, cultural events, and more. If you need people to make it happen, it belongs here.",
              },
              {
                q: "How does crowdfunding work?",
                a: "Creators can optionally enable crowdfunding with a goal amount. Payments are processed through Stripe. Funds go directly to the creator to use toward the endeavor.",
              },
              {
                q: "Can I set a cost to join?",
                a: "Yes. Creators can set a per-person cost that participants pay when joining. This is useful for trips, expeditions, or events with shared expenses.",
              },
              {
                q: "How do I find endeavors?",
                a: "Browse the feed, explore categories, filter by location type, search by keyword, or check the hiring board for endeavors that need your specific skills.",
              },
              {
                q: "What's the difference between 'open' and 'request' join types?",
                a: "Open join means anyone can join immediately. Request join means the creator reviews and approves each person who wants to join.",
              },
              {
                q: "Can I leave an endeavor after joining?",
                a: "Yes, you can leave any endeavor at any time from the endeavor detail page.",
              },
              {
                q: "What are stories?",
                a: "Stories are written accounts of endeavor experiences — published by members to share what happened, what they learned, and how the endeavor went. Think of them as trip reports, project retrospectives, or personal reflections.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group border border-medium-gray/20 open:border-code-green/30"
              >
                <summary className="cursor-pointer px-5 py-4 text-sm font-semibold hover:text-code-green transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-medium-gray group-open:rotate-45 transition-transform text-lg">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm text-light-gray leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// principles"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Action over talk",
                desc: "This is a platform for doing, not just discussing. Every feature is designed to move endeavors forward.",
              },
              {
                title: "Open by default",
                desc: "Endeavors are public. Anyone can discover and join. Transparency builds trust and attracts the right people.",
              },
              {
                title: "Creator ownership",
                desc: "Creators control their endeavors — who joins, how it's organized, whether to charge or crowdfund.",
              },
              {
                title: "No gatekeeping",
                desc: "No algorithms deciding what you see. No artificial barriers. Search, browse, and join based on your interests and skills.",
              },
            ].map((p) => (
              <div key={p.title} className="border-l-2 border-code-green/30 pl-4 py-2">
                <h3 className="font-semibold text-sm">{p.title}</h3>
                <p className="text-xs text-medium-gray mt-1 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// contact"}
          </h2>
          <p className="text-sm text-light-gray">
            Questions, feedback, or partnership inquiries? Reach out at{" "}
            <span className="text-code-blue">hello@endeavor.app</span>
          </p>
        </section>
      </main>

      <CTA />
      <Footer />
    </div>
  );
}
