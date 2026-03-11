import { Suspense } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { ExplorePreview } from "@/components/explore-preview";
import { ExplorePreviewLive } from "@/components/explore-preview-live";
import { About } from "@/components/about";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { PlatformStats } from "@/components/platform-stats";
import { FeaturedStories } from "@/components/featured-stories";
import { Spotlight } from "@/components/spotlight";
import { TrendingCreators } from "@/components/trending-creators";
import { MiniStats } from "@/components/mini-stats";
import { PopularCategories } from "@/components/popular-categories";
import { TopContributors } from "@/components/top-contributors";

export const dynamic = "force-dynamic";

async function LiveOrStaticExplore() {
  const liveContent = await ExplorePreviewLive();
  if (liveContent) return liveContent;
  return <ExplorePreview />;
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Endeavor",
    description:
      "Post what you want to do. Find people who want to do it with you. Plan it, fund it, make it happen.",
    url: process.env.BETTER_AUTH_URL || "https://endeavor.vercel.app",
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <Suspense fallback={<ExplorePreview />}>
          <LiveOrStaticExplore />
        </Suspense>
        <Suspense fallback={null}>
          <PlatformStats />
        </Suspense>
        <Suspense fallback={null}>
          <FeaturedStories />
        </Suspense>
        <Suspense fallback={null}>
          <Spotlight />
        </Suspense>
        <Suspense fallback={null}>
          <TrendingCreators />
        </Suspense>
        <section className="flex justify-center py-8">
          <MiniStats />
        </section>
        <Suspense fallback={null}>
          <PopularCategories />
        </Suspense>
        <Suspense fallback={null}>
          <TopContributors />
        </Suspense>
        <About />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
