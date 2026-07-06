import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { LatestRideSection } from "@/components/home/latest-ride-section";
import { UpcomingEventsSection } from "@/components/home/upcoming-events-section";
import { RecentBlogsSection } from "@/components/home/recent-blogs-section";
import { GalleryPreviewSection } from "@/components/home/gallery-preview-section";
import { RideStatsSection } from "@/components/home/ride-stats-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { SocialFeedSection } from "@/components/home/social-feed-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { SectionSkeleton } from "@/components/home/section-skeleton";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

// Revalidate the home page every 5 minutes (ISR) so newly published rides,
// events, and blogs surface quickly without needing a full redeploy, while
// still serving a cached, edge-fast response for the vast majority of visits.
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <Suspense fallback={<SectionSkeleton heightClassName="h-[420px]" />}>
        <LatestRideSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton heightClassName="h-96" />}>
        <UpcomingEventsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton heightClassName="h-96" />}>
        <RecentBlogsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton heightClassName="h-96" />}>
        <GalleryPreviewSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton heightClassName="h-32" />}>
        <RideStatsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton heightClassName="h-96" />}>
        <TestimonialsSection />
      </Suspense>

      <SocialFeedSection />

      <NewsletterSection />
    </>
  );
}
