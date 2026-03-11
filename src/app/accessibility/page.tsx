import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Accessibility", href: "/accessibility" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Accessibility</h1>
        <p className="mb-12 text-lg text-light-gray leading-relaxed">
          Endeavor is committed to making our platform accessible to everyone,
          regardless of ability or assistive technology. We believe that
          collaboration should be open to all.
        </p>

        {/* Our Commitment */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// our commitment"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              We are working toward conformance with the{" "}
              <a
                href="https://www.w3.org/TR/WCAG21/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-code-blue hover:text-code-green"
              >
                Web Content Accessibility Guidelines (WCAG) 2.1
              </a>{" "}
              at the AA level. These guidelines define how to make web content
              more accessible to people with disabilities, including visual,
              auditory, motor, and cognitive impairments.
            </p>
            <p>
              Accessibility is an ongoing effort. We regularly audit our platform,
              fix issues as they are identified, and incorporate accessibility
              into our development process from the start.
            </p>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// accessibility features"}
          </h2>
          <div className="space-y-6 text-sm leading-relaxed text-light-gray">
            <div className="border-l-2 border-code-green/30 pl-4 py-2">
              <h3 className="font-semibold text-white">Keyboard Navigation</h3>
              <p className="mt-1 text-medium-gray">
                All interactive elements are reachable and operable via keyboard.
                You can navigate the entire platform using Tab, Shift+Tab, Enter,
                Space, and arrow keys without requiring a mouse.
              </p>
            </div>
            <div className="border-l-2 border-code-green/30 pl-4 py-2">
              <h3 className="font-semibold text-white">Screen Reader Support</h3>
              <p className="mt-1 text-medium-gray">
                We use semantic HTML elements, ARIA labels, and landmarks to
                ensure screen readers can accurately convey the structure and
                content of each page. Navigation, forms, and dynamic content are
                announced appropriately.
              </p>
            </div>
            <div className="border-l-2 border-code-green/30 pl-4 py-2">
              <h3 className="font-semibold text-white">Focus Indicators</h3>
              <p className="mt-1 text-medium-gray">
                Visible focus indicators are provided for all interactive elements
                so keyboard users can always see where they are on the page.
                Focus styles are designed to be clearly visible against the
                platform&apos;s dark background.
              </p>
            </div>
            <div className="border-l-2 border-code-green/30 pl-4 py-2">
              <h3 className="font-semibold text-white">Reduced Motion Support</h3>
              <p className="mt-1 text-medium-gray">
                Animations and transitions respect the{" "}
                <code className="text-code-blue">prefers-reduced-motion</code>{" "}
                media query. Users who have enabled reduced motion in their
                operating system settings will see simplified or no animations.
              </p>
            </div>
            <div className="border-l-2 border-code-green/30 pl-4 py-2">
              <h3 className="font-semibold text-white">Skip to Content</h3>
              <p className="mt-1 text-medium-gray">
                A skip-to-content link is available at the top of each page,
                allowing keyboard and screen reader users to bypass repetitive
                navigation and jump directly to the main content.
              </p>
            </div>
            <div className="border-l-2 border-code-green/30 pl-4 py-2">
              <h3 className="font-semibold text-white">Semantic HTML</h3>
              <p className="mt-1 text-medium-gray">
                Pages are built with proper heading hierarchy, landmark regions,
                lists, and other semantic elements. This ensures that assistive
                technologies can parse and present content in a meaningful way.
              </p>
            </div>
          </div>
        </section>

        {/* Known Limitations */}
        <section className="mb-16">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// known limitations"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              While we strive for full accessibility, some areas of the platform
              may not yet meet all WCAG 2.1 AA criteria. We are aware of the
              following limitations and are actively working to address them:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                Some user-uploaded images may not have descriptive alternative
                text. We encourage creators to add alt text when uploading images.
              </li>
              <li>
                Third-party embedded content (such as external maps or payment
                forms) may have their own accessibility limitations outside our
                direct control.
              </li>
              <li>
                Older content created before our accessibility improvements may
                not fully conform. We are retrofitting these pages over time.
              </li>
            </ul>
          </div>
        </section>

        {/* Feedback and Contact */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// feedback and contact"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              We welcome feedback on the accessibility of the Endeavor platform.
              If you encounter any barriers, have suggestions for improvement, or
              need content in an alternative format, please let us know:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                Email:{" "}
                <span className="text-code-blue">accessibility@endeavor.app</span>
              </li>
              <li>
                Use the{" "}
                <Link href="/contact" className="text-code-blue hover:text-code-green">
                  Contact
                </Link>{" "}
                page and select &quot;Accessibility&quot; as the topic
              </li>
              <li>
                Visit the{" "}
                <Link href="/help" className="text-code-blue hover:text-code-green">
                  Help Center
                </Link>{" "}
                for general support
              </li>
            </ul>
            <p>
              We aim to respond to accessibility-related inquiries within 5
              business days and to resolve reported issues as quickly as possible.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
