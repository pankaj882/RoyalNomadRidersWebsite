import Image from "next/image";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { siteConfig } from "@/lib/constants";

export function AboutHero() {
  return (
    <section className="relative flex min-h-[50vh] items-center overflow-hidden bg-nomad-black">
      <Image
        src="https://images.unsplash.com/photo-1516053917400-643037c2bfe6?q=80&w=2400&auto=format&fit=crop"
        alt="Riders gathered around motorcycles at a mountain campsite"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-nomad-black via-nomad-black/70 to-nomad-black/30" />

      <div className="container relative z-10 pt-16 text-center">
        <AnimatedContainer className="mx-auto max-w-2xl">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-nomad-red">
            About The Club
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-nomad-white sm:text-6xl">
            Riders First. <span className="text-nomad-red">Always.</span>
          </h1>
          <p className="mt-4 text-balance text-base text-nomad-fog sm:text-lg">
            The story, the people, and the principles behind {siteConfig.name}.
          </p>
        </AnimatedContainer>
      </div>
    </section>
  );
}
