import type { Metadata } from "next";
import { CalendarX } from "lucide-react";
import { EventCard } from "@/components/shared/event-card";
import { PastEventCard } from "@/components/events/past-event-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Pagination } from "@/components/shared/pagination";
import { getUpcomingEventsList, getPastEventsList } from "@/lib/data/events";
import { buildMetadata, buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: "Upcoming Rides & Events",
  description: `Join an upcoming ride with ${siteConfig.name} — mountain expeditions, coastal runs, off-road trails, and weekend rides.`,
  path: "/events",
});

interface EventsPageProps {
  searchParams: Promise<{ page?: string; pastPage?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const page = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1;
  const pastPage = params.pastPage ? Math.max(1, parseInt(params.pastPage, 10) || 1) : 1;

  const [upcoming, past] = await Promise.all([
    getUpcomingEventsList({ page }),
    getPastEventsList({ page: pastPage, pageSize: 6 }),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />

      <section className="border-b border-nomad-steel bg-nomad-charcoal py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Saddle Up"
            title="Upcoming Rides"
            description="Every club ride, from weekend breakfast runs to multi-day mountain expeditions. Register below to lock in your seat."
          />
        </div>
      </section>

      <section className="bg-nomad-black py-12 sm:py-16">
        <div className="container flex flex-col gap-10">
          {upcoming.items.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="No Rides Scheduled Yet"
              description="The next club ride hasn't been announced yet — check back soon."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.items.map((event, index) => (
                  <AnimatedContainer key={event.id} delay={(index % 3) * 0.08}>
                    <EventCard event={event} priority={index < 3} />
                  </AnimatedContainer>
                ))}
              </div>
              <Pagination
                meta={upcoming.meta}
                buildHref={(p) => (p > 1 ? `/events?page=${p}` : "/events")}
              />
            </>
          )}
        </div>
      </section>

      {past.items.length > 0 && (
        <section className="border-t border-nomad-steel bg-nomad-charcoal py-16 sm:py-20">
          <div className="container flex flex-col gap-8">
            <SectionHeading
              eyebrow="Ride Archive"
              title="Past Rides"
              description="Completed rides from the club — a look back at where we've already been."
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.items.map((event) => (
                <PastEventCard key={event.id} event={event} />
              ))}
            </div>
            <Pagination
              meta={past.meta}
              buildHref={(p) => (p > 1 ? `/events?pastPage=${p}#past-rides` : "/events#past-rides")}
            />
          </div>
        </section>
      )}
    </>
  );
}
