import type { Metadata } from "next";
import { FallbackImage } from "@/components/shared/fallback-image";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Gauge, Clock, User, Users, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RegistrationForm } from "@/components/events/registration-form";
import { getEventBySlug, getAllEventSlugs } from "@/lib/data/events";
import { buildMetadata, buildBreadcrumbJsonLd, buildEventJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { formatDate, formatDistance } from "@/lib/utils";
import { DIFFICULTY_LABELS } from "@/lib/constants";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 300;

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return buildMetadata({
      title: "Ride Not Found",
      description: "This ride doesn't exist or has been removed.",
      path: `/events/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: event.title,
    description: event.description,
    path: `/events/${event.slug}`,
    image: event.coverImageUrl,
  });
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const isPast = event.startDate.getTime() < Date.now();
  const canRegister = !isPast && event.registrationOpen && event.status !== "CANCELLED";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: event.title, path: `/events/${event.slug}` },
  ]);

  const eventJsonLd = buildEventJsonLd({
    name: event.title,
    description: event.description,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString(),
    meetingPoint: event.meetingPoint,
    destination: event.destination,
    coverImageUrl: event.coverImageUrl,
    slug: event.slug,
    status: event.status,
  });

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <script {...jsonLdScriptProps(eventJsonLd)} />

      <section className="relative flex min-h-[45vh] items-end overflow-hidden bg-nomad-black">
        <FallbackImage src={event.coverImageUrl} alt={event.title} fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-nomad-black via-nomad-black/60 to-transparent" />

        <div className="container relative z-10 pb-12 pt-32">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{DIFFICULTY_LABELS[event.difficulty]}</Badge>
            {event.status === "CANCELLED" && <Badge variant="destructive">Cancelled</Badge>}
            {isPast && event.status !== "CANCELLED" && <Badge variant="secondary">Completed</Badge>}
          </div>
          <h1 className="max-w-3xl text-balance font-display text-3xl font-bold leading-tight text-nomad-white sm:text-5xl">
            {event.title}
          </h1>
        </div>
      </section>

      <section className="bg-nomad-black py-12 sm:py-16">
        <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="mb-3 font-display text-xl font-semibold text-nomad-white">About This Ride</h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-nomad-ash">{event.description}</p>
            </div>

            {canRegister ? (
              <div className="rounded-xl border border-nomad-steel bg-nomad-charcoal p-6 sm:p-8">
                <h2 className="mb-6 font-display text-xl font-semibold text-nomad-white">Register For This Ride</h2>
                <RegistrationForm eventId={event.id} eventTitle={event.title} />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-nomad-steel bg-nomad-charcoal/40 p-10 text-center">
                <Ban className="h-8 w-8 text-nomad-ash" />
                <h3 className="font-display text-lg font-semibold text-nomad-white">
                  {event.status === "CANCELLED"
                    ? "This Ride Has Been Cancelled"
                    : isPast
                      ? "This Ride Has Already Taken Place"
                      : "Registration Is Closed"}
                </h3>
                <p className="max-w-sm text-sm text-nomad-ash">
                  {event.status === "CANCELLED"
                    ? "Check the events page for other upcoming rides."
                    : isPast
                      ? "Browse the gallery or blog for photos and stories from this ride."
                      : "Registration for this ride has closed. Check back for future rides."}
                </p>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-nomad-steel bg-nomad-charcoal p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-nomad-ash">Ride Details</h3>
              <dl className="flex flex-col gap-3.5 text-sm">
                <DetailRow icon={MapPin} label="Destination" value={event.destination} />
                <DetailRow icon={MapPin} label="Meeting Point" value={event.meetingPoint} />
                <DetailRow icon={CalendarDays} label="Date" value={formatDate(event.startDate)} />
                <DetailRow icon={Clock} label="Meeting Time" value={event.meetingTime} />
                <DetailRow icon={Gauge} label="Distance" value={formatDistance(event.distanceKm)} />
                <DetailRow icon={User} label="Ride Captain" value={event.rideCaptainName} />
                <DetailRow
                  icon={Users}
                  label="Seats"
                  value={
                    event.seatsRemaining > 0
                      ? `${event.seatsRemaining} of ${event.maxSeats} left`
                      : `Full (${event.maxSeats} riders)`
                  }
                />
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-nomad-ash">
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </span>
      <span className="text-right font-medium text-nomad-fog">{value}</span>
    </div>
  );
}
