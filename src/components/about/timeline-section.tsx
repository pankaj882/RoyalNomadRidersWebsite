import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { timelineMilestones } from "@/lib/data/club-info";

export function TimelineSection() {
  return (
    <section id="timeline" className="scroll-mt-24 border-t border-nomad-steel bg-nomad-charcoal py-20 sm:py-28">
      <div className="container">
        <SectionHeading eyebrow="The Journey" title="Club Timeline" align="center" className="mx-auto mb-16 max-w-2xl" />

        <div className="relative mx-auto max-w-3xl">
          <div
            className="absolute left-4 top-0 h-full w-px bg-nomad-steel sm:left-1/2 sm:-translate-x-1/2"
            aria-hidden="true"
          />
          <ol className="flex flex-col gap-10">
            {timelineMilestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              return (
                <li key={milestone.year} className="relative">
                  <AnimatedContainer
                    delay={index * 0.06}
                    className={`flex flex-col gap-2 pl-12 sm:w-1/2 sm:pl-0 ${
                      isEven ? "sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12"
                    }`}
                  >
                    <span
                      className="absolute left-4 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-nomad-gold bg-nomad-black sm:left-1/2"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-nomad-gold">
                      {milestone.year}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-nomad-white">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-nomad-ash">{milestone.description}</p>
                  </AnimatedContainer>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
