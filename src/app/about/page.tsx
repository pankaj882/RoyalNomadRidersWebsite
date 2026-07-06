import type { Metadata } from "next";
import { AboutHero } from "@/components/about/about-hero";
import { HistorySection } from "@/components/about/history-section";
import { MissionVisionSection } from "@/components/about/mission-vision-section";
import { SafetyGuidelinesSection } from "@/components/about/safety-guidelines-section";
import { CoreMembersSection } from "@/components/about/core-members-section";
import { TimelineSection } from "@/components/about/timeline-section";
import { buildMetadata, buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description: `The history, mission, safety guidelines, and core members behind ${siteConfig.name} — an adventure motorcycle riding community.`,
  path: "/about",
});

export const revalidate = 3600;

export default function AboutPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <AboutHero />
      <HistorySection />
      <MissionVisionSection />
      <SafetyGuidelinesSection />
      <CoreMembersSection />
      <TimelineSection />
    </>
  );
}
