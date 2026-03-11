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

export const dynamic = "force-dynamic";

async function LiveOrStaticExplore() {
  const liveContent = await ExplorePreviewLive();
  if (liveContent) return liveContent;
  return <ExplorePreview />;
}

export default function Home() {
  return (
    <>
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
        <About />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
