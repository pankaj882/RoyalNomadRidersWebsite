import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FoundationNotice />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-nomad-black">
      <Image
        src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2400&auto=format&fit=crop"
        alt="Adventure motorcycle riders crossing a mountain pass at sunrise"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-nomad-black via-nomad-black/60 to-nomad-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-nomad-black/80 via-transparent to-nomad-black/40" />

      <div className="container relative z-10 pt-16">
        <AnimatedContainer className="max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-nomad-red/40 bg-nomad-red/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-nomad-red">
            <MapPin className="h-3.5 w-3.5" />
            Est. {siteConfig.founded} &middot; India
          </span>
          <h1 className="text-balance font-display text-5xl font-bold leading-[0.95] tracking-tight text-nomad-white sm:text-7xl lg:text-8xl">
            RIDE FAR.
            <br />
            <span className="text-nomad-red">RIDE FREE.</span>
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base text-nomad-fog sm:text-lg">
            {siteConfig.description}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/events">
                Join The Next Ride
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/gallery">Explore The Gallery</Link>
            </Button>
          </div>
        </AnimatedContainer>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-nomad-ash">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-nomad-red to-transparent" />
      </div>
    </section>
  );
}

function FoundationNotice() {
  return (
    <section className="border-t border-nomad-steel bg-nomad-charcoal py-16">
      <div className="container">
        <AnimatedContainer className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-nomad-white">
            The Foundation Is Live
          </h2>
          <p className="mt-3 text-sm text-nomad-ash">
            This is the Phase 1 project scaffold — theme, navigation, authentication, and
            architecture are wired end-to-end. Latest Ride, Upcoming Events, Recent Blogs, the
            Gallery Preview, Ride Statistics, Testimonials, Instagram Feed, and the full Newsletter
            section land on this page in Phase 2.
          </p>
        </AnimatedContainer>
      </div>
    </section>
  );
}
