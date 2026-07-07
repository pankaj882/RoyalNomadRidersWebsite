import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { safetyGuidelines } from "@/lib/data/club-info";

export function SafetyGuidelinesSection() {
  return (
    <section id="safety" className="scroll-mt-24 bg-nomad-black py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Ride Smart"
          title="Safety Guidelines"
          description="Every rider agrees to these principles before joining a club ride. They exist because we've learned what happens when they're ignored."
          align="center"
          className="mx-auto mb-14 max-w-2xl"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {safetyGuidelines.map((guideline, index) => {
            const Icon = guideline.icon;
            return (
              <AnimatedContainer
                key={guideline.title}
                delay={index * 0.08}
                className="flex flex-col gap-4 rounded-lg border border-nomad-steel bg-nomad-charcoal p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-nomad-gold/10">
                  <Icon className="h-5 w-5 text-nomad-gold" />
                </span>
                <h3 className="font-display text-lg font-semibold text-nomad-white">
                  {guideline.title}
                </h3>
                <p className="text-sm leading-relaxed text-nomad-ash">{guideline.description}</p>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </section>
  );
}
