import { Target, Eye } from "lucide-react";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { missionStatement, visionStatement } from "@/lib/data/club-info";

export function MissionVisionSection() {
  return (
    <section className="border-y border-nomad-steel bg-nomad-charcoal py-20 sm:py-28">
      <div className="container">
        <h2 className="sr-only">Our Mission and Vision</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <AnimatedContainer className="flex flex-col gap-4 rounded-xl border border-nomad-steel bg-nomad-black p-8 sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-nomad-gold/10">
              <Target className="h-6 w-6 text-nomad-gold" />
            </span>
            <h3 className="font-display text-2xl font-bold text-nomad-white">Our Mission</h3>
            <p className="text-base leading-relaxed text-nomad-ash">{missionStatement}</p>
          </AnimatedContainer>

          <AnimatedContainer
            delay={0.1}
            className="flex flex-col gap-4 rounded-xl border border-nomad-steel bg-nomad-black p-8 sm:p-10"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-nomad-gold/10">
              <Eye className="h-6 w-6 text-nomad-gold" />
            </span>
            <h3 className="font-display text-2xl font-bold text-nomad-white">Our Vision</h3>
            <p className="text-base leading-relaxed text-nomad-ash">{visionStatement}</p>
          </AnimatedContainer>
        </div>
      </div>
    </section>
  );
}
