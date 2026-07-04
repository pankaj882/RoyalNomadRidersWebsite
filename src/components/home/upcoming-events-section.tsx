import Link from "next/link";
import { ArrowRight, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { EmptyState } from "@/components/shared/empty-state";
import { EventCard } from "@/components/shared/event-card";
import { getUpcomingEvents } from "@/lib/data/home";

export async function UpcomingEventsSection() {
  const events = await getUpcomingEvents(3);

  return (
    <section className="bg-nomad-charcoal py-20 sm:py-28">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Saddle Up" title="Upcoming Rides" />
          <Button asChild variant="ghost" className="w-fit">
            <Link href="/events">
              View All Events <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No Rides Scheduled Yet"
            description="The next club ride hasn't been announced yet — check back soon or follow us on Instagram for the announcement."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <AnimatedContainer key={event.id} delay={index * 0.1}>
                <EventCard event={event} priority={index === 0} />
              </AnimatedContainer>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
