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
      <AppHeader breadcrumb={{ label: "Terms of Service", href: "/terms" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Terms of Service</h1>
        <p className="mb-12 text-sm text-medium-gray">
          Effective date: March 11, 2026 &middot; Last updated: March 11, 2026
        </p>

        <p className="mb-12 text-sm leading-relaxed text-light-gray">
          Welcome to Endeavor. These Terms of Service (&quot;Terms&quot;) govern your
          access to and use of the Endeavor platform, including our website, applications,
          APIs, and all related services (collectively, the &quot;Platform&quot;). By
          creating an account or using the Platform, you agree to be bound by these Terms.
          If you do not agree, please do not use Endeavor.
        </p>

        {/* Acceptable Use */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// acceptable use"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              You agree to use Endeavor in a manner that is lawful, respectful, and
              consistent with the spirit of collaborative endeavor. Specifically, you agree
              not to:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                Post, upload, or share content that is illegal, harmful, threatening,
                abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable
              </li>
              <li>
                Create endeavors that promote illegal activities, violence, discrimination,
                or harm to individuals or groups
              </li>
              <li>
                Distribute spam, chain letters, pyramid schemes, or other unsolicited
                commercial communications
              </li>
              <li>
                Impersonate any person or entity, or falsely claim an affiliation with any
                person or entity
              </li>
              <li>
                Interfere with, disrupt, or place an undue burden on the Platform or its
                infrastructure, including through automated scraping, bots, or denial-of-service
                attacks
              </li>
              <li>
                Attempt to gain unauthorized access to other user accounts, computer systems,
                or networks connected to the Platform
              </li>
              <li>
                Use the Platform to harvest, collect, or store personal data about other
                users without their explicit consent
              </li>
              <li>
                Circumvent, disable, or otherwise interfere with security-related features
                of the Platform
              </li>
              <li>
                Post misleading information about endeavors, including false descriptions,
                fabricated qualifications, or deceptive funding goals
              </li>
            </ul>
            <p>
              We reserve the right to investigate and take appropriate action against
              anyone who, in our sole discretion, violates these guidelines, including
              removing content, suspending or terminating accounts, and reporting conduct
              to law enforcement authorities.
            </p>
          </div>
        </section>

        {/* User Content Ownership and Licensing */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// user content ownership and licensing"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <div>
              <h3 className="mb-2 font-semibold text-white">Your Ownership</h3>
              <p>
                You retain all ownership rights to the content you create and post on
                Endeavor, including endeavor descriptions, comments, discussions, images,
                files, stories, and any other materials (&quot;User Content&quot;). Endeavor
                does not claim ownership of your User Content.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">License to Endeavor</h3>
              <p>
                By posting User Content on the Platform, you grant Endeavor a worldwide,
                non-exclusive, royalty-free, sublicensable, and transferable license to use,
                reproduce, modify, distribute, display, and perform your User Content solely
                in connection with operating and providing the Platform. This license
                continues until you delete the content or your account, at which point we
                will cease displaying your content within a commercially reasonable timeframe,
                except where it has been shared with or adopted by other users as part of a
                collaborative endeavor.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Collaborative Content</h3>
              <p>
                Endeavors are inherently collaborative. Content created collectively within
                an endeavor (such as shared documents, group discussions, and collaborative
                outputs) may be subject to shared rights among participants. We encourage
                endeavor creators to clearly define content ownership and licensing terms
                within their endeavor description. In the absence of explicit terms, all
                participants retain rights to their individual contributions.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Content Responsibilities</h3>
              <p>
                You are solely responsible for your User Content. You represent and warrant
                that you have all necessary rights to post the content and that your content
                does not infringe upon the intellectual property rights, privacy rights, or
                any other rights of any third party.
              </p>
            </div>
          </div>
        </section>

        {/* Account Responsibilities */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// account responsibilities"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <ul className="ml-4 list-disc space-y-3">
              <li>
                <strong className="text-white">Accurate information:</strong> You must
                provide truthful and accurate information when creating your account. You
                agree to keep your account information up to date.
              </li>
              <li>
                <strong className="text-white">Account security:</strong> You are responsible
                for maintaining the confidentiality of your password and for all activity
                that occurs under your account. You agree to notify us immediately of any
                unauthorized use of your account.
              </li>
              <li>
                <strong className="text-white">Age requirement:</strong> You must be at
                least 13 years of age to create an account on Endeavor. If you are between
                13 and 18 years of age, you must have the consent of a parent or legal
                guardian to use the Platform.
              </li>
              <li>
                <strong className="text-white">One account per person:</strong> Each
                individual may maintain only one account. Duplicate accounts may be removed
                without notice.
              </li>
              <li>
                <strong className="text-white">Account transferability:</strong> Your account
                is personal to you and may not be transferred, sold, or assigned to another
                person without our prior written consent.
              </li>
            </ul>
          </div>
        </section>

        {/* Payments and Transactions */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// payments and transactions"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              Certain endeavors on the Platform may involve financial transactions,
              including cost-to-join fees set by endeavor creators and crowdfunding
              contributions. All payments are processed securely through Stripe.
            </p>
            <ul className="ml-4 list-disc space-y-3">
              <li>
                <strong className="text-white">Platform role:</strong> Endeavor acts as a
                facilitator connecting endeavor creators with participants. We are not a
                party to the transaction between creators and participants, and we do not
                guarantee the outcome, quality, or completion of any endeavor.
              </li>
              <li>
                <strong className="text-white">Creator responsibilities:</strong> Endeavor
                creators who collect fees or crowdfunding contributions are responsible for
                using those funds as described in their endeavor listing and for complying
                with all applicable laws and regulations.
              </li>
              <li>
                <strong className="text-white">Refunds:</strong> Refund policies are
                determined by individual endeavor creators. Endeavor does not process refunds
                directly. Disputes regarding payments should be directed to the endeavor
                creator in the first instance. If resolution cannot be reached, you may
                contact us for mediation.
              </li>
              <li>
                <strong className="text-white">Fees:</strong> Endeavor may charge service
                fees on transactions processed through the Platform. Any applicable fees will
                be clearly disclosed before you complete a transaction.
              </li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// intellectual property"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              The Endeavor platform, including its design, logos, trademarks, source code,
              documentation, and all associated intellectual property, is owned by Endeavor
              and protected by copyright, trademark, and other intellectual property laws.
              You may not copy, modify, distribute, sell, or lease any part of the Platform
              or its underlying technology without our prior written consent.
            </p>
            <p>
              The code-inspired aesthetic, layout, and branding of Endeavor are proprietary.
              You may not create derivative works or competing services that substantially
              replicate the look, feel, or functionality of the Platform.
            </p>
            <p>
              If you believe that content on the Platform infringes your intellectual
              property rights, please{" "}
              <Link href="/contact" className="text-code-blue hover:text-code-green">
                contact us
              </Link>{" "}
              with a detailed description of the alleged infringement, including
              identification of the copyrighted work, the infringing material, and your
              contact information. We will investigate and respond in accordance with
              applicable law.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// limitation of liability"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              <strong className="text-white">
                The Platform is provided on an &quot;as is&quot; and &quot;as available&quot;
                basis without warranties of any kind, either express or implied.
              </strong>{" "}
              To the fullest extent permitted by applicable law, Endeavor disclaims all
              warranties, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, and non-infringement.
            </p>
            <p>Endeavor does not warrant that:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>The Platform will be available at all times or free from errors, interruptions, or security vulnerabilities</li>
              <li>The results obtained from using the Platform will be accurate or reliable</li>
              <li>Any endeavor listed on the Platform will be completed, successful, or as described by its creator</li>
              <li>Other users will fulfill their commitments or behave in a trustworthy manner</li>
            </ul>
            <p>
              <strong className="text-white">
                To the maximum extent permitted by law, Endeavor shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, including
                but not limited to loss of profits, data, use, or goodwill, arising out of
                or in connection with your use of the Platform.
              </strong>{" "}
              This limitation applies regardless of the theory of liability and whether or
              not Endeavor has been advised of the possibility of such damages.
            </p>
            <p>
              You acknowledge that participation in endeavors involves inherent risks. You
              participate in endeavors at your own risk and are solely responsible for any
              consequences arising from your involvement, including physical activities,
              financial contributions, and interpersonal interactions.
            </p>
          </div>
        </section>

        {/* Indemnification */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// indemnification"}
          </h2>
          <div className="text-sm leading-relaxed text-light-gray">
            <p>
              You agree to indemnify, defend, and hold harmless Endeavor, its officers,
              directors, employees, agents, and affiliates from and against any and all
              claims, liabilities, damages, losses, costs, and expenses (including
              reasonable attorneys&apos; fees) arising out of or related to: (a) your use of
              the Platform; (b) your User Content; (c) your violation of these Terms; (d)
              your violation of any rights of another party; or (e) your participation in
              any endeavor, including any financial transactions, physical activities, or
              disputes with other users.
            </p>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// termination"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <div>
              <h3 className="mb-2 font-semibold text-white">By You</h3>
              <p>
                You may terminate your account at any time by visiting your{" "}
                <Link href="/settings" className="text-code-blue hover:text-code-green">
                  Settings
                </Link>{" "}
                page and initiating account deletion. Upon deletion, your profile and
                personal data will be removed in accordance with our{" "}
                <Link href="/privacy" className="text-code-blue hover:text-code-green">
                  Privacy Policy
                </Link>
                . Content you contributed to collaborative endeavors may persist in
                anonymized form where other participants depend on it.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">By Endeavor</h3>
              <p>
                We reserve the right to suspend or terminate your account, with or without
                notice, if we determine in our sole discretion that you have violated these
                Terms, engaged in fraudulent or illegal activity, or otherwise acted in a
                manner that is harmful to other users or the Platform. In cases of severe
                violation, termination may be immediate and without prior warning.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Effect of Termination</h3>
              <p>
                Upon termination, your right to use the Platform will immediately cease. The
                following provisions will survive termination: User Content licensing (for
                content shared in collaborative endeavors), limitation of liability,
                indemnification, and dispute resolution.
              </p>
            </div>
          </div>
        </section>

        {/* Dispute Resolution */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// dispute resolution"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <div>
              <h3 className="mb-2 font-semibold text-white">Informal Resolution</h3>
              <p>
                Before initiating any formal dispute resolution proceedings, you agree to
                first attempt to resolve any dispute informally by contacting us through
                the{" "}
                <Link href="/contact" className="text-code-blue hover:text-code-green">
                  Contact
                </Link>{" "}
                page. We will attempt to resolve the dispute informally within 30 days. Most
                concerns can be resolved through open communication.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Binding Arbitration</h3>
              <p>
                If a dispute cannot be resolved informally, you and Endeavor agree to resolve
                any claims relating to these Terms or the Platform through final and binding
                arbitration, except where prohibited by law. Arbitration will be conducted
                on an individual basis; class actions and class arbitrations are not
                permitted.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws
                of the State of Delaware, United States, without regard to its conflict of
                law provisions. Any legal proceedings that are not subject to arbitration
                shall be brought exclusively in the courts of the State of Delaware.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Disputes Between Users</h3>
              <p>
                Endeavor is not responsible for disputes between users, including disputes
                arising from endeavor participation, financial contributions, or
                collaborative work. While we may offer tools to help resolve disputes, we
                are not obligated to mediate or adjudicate conflicts between users.
              </p>
            </div>
          </div>
        </section>

        {/* Moderation and Enforcement */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// moderation and enforcement"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              We reserve the right to review, moderate, and remove User Content that
              violates these Terms or is otherwise objectionable. We may also take
              enforcement actions including:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Issuing warnings to users who violate these Terms</li>
              <li>Temporarily suspending accounts pending investigation</li>
              <li>Permanently banning users who repeatedly or severely violate these Terms</li>
              <li>Removing or disabling access to endeavors that violate our policies</li>
              <li>Reporting illegal activity to law enforcement authorities</li>
            </ul>
            <p>
              Users can report content or behavior that violates these Terms through the
              reporting features available on the Platform. We take reports seriously and
              will investigate promptly, though we are not obligated to disclose the results
              of our investigations to reporting parties.
            </p>
          </div>
        </section>

        {/* Changes to These Terms */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// changes to these terms"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              We may revise these Terms from time to time to reflect changes in the
              Platform, our business practices, or applicable law. When we make material
              changes, we will:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Post the revised Terms on this page with an updated effective date</li>
              <li>Provide prominent notice on the Platform (such as a banner or notification)</li>
              <li>Send an email notification to the address associated with your account for significant changes</li>
            </ul>
            <p>
              Your continued use of the Platform after the revised Terms take effect
              constitutes your acceptance of the changes. If you do not agree to the revised
              Terms, you must stop using the Platform and may delete your account.
            </p>
          </div>
        </section>

        {/* Miscellaneous */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// miscellaneous"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <ul className="ml-4 list-disc space-y-3">
              <li>
                <strong className="text-white">Entire agreement:</strong> These Terms,
                together with our{" "}
                <Link href="/privacy" className="text-code-blue hover:text-code-green">
                  Privacy Policy
                </Link>
                , constitute the entire agreement between you and Endeavor regarding your
                use of the Platform.
              </li>
              <li>
                <strong className="text-white">Severability:</strong> If any provision of
                these Terms is found to be unenforceable or invalid, that provision will be
                limited or eliminated to the minimum extent necessary, and the remaining
                provisions will remain in full force and effect.
              </li>
              <li>
                <strong className="text-white">No waiver:</strong> Our failure to enforce
                any right or provision of these Terms will not be considered a waiver of that
                right or provision.
              </li>
              <li>
                <strong className="text-white">Assignment:</strong> We may assign our rights
                and obligations under these Terms without restriction. You may not assign
                your rights or obligations without our prior written consent.
              </li>
              <li>
                <strong className="text-white">Force majeure:</strong> Endeavor shall not
                be liable for any failure or delay in performing its obligations where such
                failure or delay results from events beyond our reasonable control, including
                natural disasters, acts of government, internet outages, or other force
                majeure events.
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// contact"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              If you have questions about these Terms of Service, please reach out to us
              through:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                The{" "}
                <Link href="/contact" className="text-code-blue hover:text-code-green">
                  Contact
                </Link>{" "}
                page on our platform
              </li>
              <li>
                The{" "}
                <Link href="/help" className="text-code-blue hover:text-code-green">
                  Help Center
                </Link>{" "}
                for general inquiries
              </li>
              <li>Email: legal@endeavor.app</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
