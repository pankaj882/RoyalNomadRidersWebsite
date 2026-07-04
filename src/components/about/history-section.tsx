import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { historyParagraphs } from "@/lib/data/club-info";

export function HistorySection() {
  return (
    <section className="bg-nomad-black py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Where We Started" title="Our History" className="mb-10" />
          <AnimatedContainer className="flex flex-col gap-5">
            {historyParagraphs.map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-nomad-fog sm:text-lg">
                {paragraph}
              </p>
            ))}
          </AnimatedContainer>
        </div>
      </div>
    </section>
  );
}
