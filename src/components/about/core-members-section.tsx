import { Instagram, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { EmptyState } from "@/components/shared/empty-state";
import { getCoreMembers } from "@/lib/data/about";
import { getInitials } from "@/lib/utils";

export async function CoreMembersSection() {
  const members = await getCoreMembers();

  return (
    <section id="members" className="scroll-mt-24 bg-nomad-black py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="The People"
          title="Core Members"
          align="center"
          className="mx-auto mb-14 max-w-2xl"
        />

        {members.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="Core Team Coming Soon"
            description="Founding member profiles will appear here once they're added in the admin dashboard."
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {members.map((member, index) => (
              <AnimatedContainer
                key={member.id}
                delay={index * 0.06}
                className="flex flex-col items-center gap-3 text-center"
              >
                <Avatar className="h-24 w-24 border-2 border-nomad-steel">
                  {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt={member.name} />}
                  <AvatarFallback className="text-lg">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-base font-semibold text-nomad-white">
                    {member.name}
                  </p>
                  {member.founderTitle && (
                    <p className="text-xs uppercase tracking-wide text-nomad-red">
                      {member.founderTitle}
                    </p>
                  )}
                </div>
                {member.instagramHandle && (
                  <a
                    href={`https://instagram.com/${member.instagramHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-nomad-ash hover:text-nomad-red"
                  >
                    <Instagram className="h-3.5 w-3.5" />@{member.instagramHandle.replace("@", "")}
                  </a>
                )}
              </AnimatedContainer>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
