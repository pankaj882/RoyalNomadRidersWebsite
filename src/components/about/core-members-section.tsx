import Image from "next/image";
import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { teamMembers } from "@/lib/data/team-members";

export function CoreMembersSection() {
  return (
    <section id="members" className="scroll-mt-24 bg-nomad-black py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="The People"
          title="Core Members"
          description="The riders who keep the club running — planning routes, running safety briefings, and welcoming every new rider personally."
          align="center"
          className="mx-auto mb-14 max-w-2xl"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <AnimatedContainer key={member.id} delay={index * 0.06}>
              <article className="group flex h-full flex-col items-center gap-4 rounded-xl border border-nomad-steel bg-nomad-charcoal p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-nomad-red/60 hover:shadow-[0_12px_40px_-12px_rgba(200,30,44,0.35)]">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-nomad-steel transition-colors duration-300 group-hover:border-nomad-red">
                  <Image
                    src={member.photoUrl}
                    alt={member.name}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <div>
                  <h3 className="font-display text-lg font-semibold text-nomad-white">{member.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-nomad-red">
                    {member.designation}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-nomad-ash">{member.description}</p>

                <a
                  href={`https://instagram.com/${member.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center gap-1.5 rounded-full border border-nomad-steel px-3.5 py-1.5 text-xs font-medium text-nomad-fog transition-colors hover:border-nomad-red hover:text-nomad-red"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  @{member.instagramHandle}
                </a>
              </article>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
