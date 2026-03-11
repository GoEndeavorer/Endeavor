import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Endeavor",
  description: "Endeavor's terms of service — the rules and guidelines for using the platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-sm text-medium-gray">Last updated: March 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-light-gray">
          <section>
            <h2 className="mb-2 text-lg font-bold text-white">1. Acceptance</h2>
            <p>
              By using Endeavor, you agree to these terms. If you don&apos;t agree, please don&apos;t use the platform.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">2. Your Account</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to use Endeavor</li>
              <li>One person, one account — duplicate accounts may be removed</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">3. Content</h2>
            <p>
              You retain ownership of content you post on Endeavor. By posting, you grant us a license to display and distribute your content on the platform. You agree not to post:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Illegal, harmful, or abusive content</li>
              <li>Spam, scams, or misleading information</li>
              <li>Content that infringes on others&apos; intellectual property</li>
              <li>Endeavors promoting illegal activities</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">4. Payments</h2>
            <p>
              Payments are processed through Stripe. Cost-to-join and crowdfunding contributions are between you and the endeavor creator. Endeavor facilitates but does not guarantee refunds — contact the endeavor creator directly for disputes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">5. Moderation</h2>
            <p>
              We reserve the right to remove content and suspend accounts that violate these terms.
              Users can{" "}
              <Link href="/feed" className="text-code-blue hover:text-code-green">
                report
              </Link>{" "}
              content that violates our guidelines.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">6. Liability</h2>
            <p>
              Endeavor is provided &quot;as is&quot; without warranties. We are not responsible for the actions of endeavor creators or participants. Participate in endeavors at your own risk.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">7. Changes</h2>
            <p>
              We may update these terms. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
