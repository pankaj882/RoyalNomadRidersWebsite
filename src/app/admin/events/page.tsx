import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireManagementAccess } from "@/lib/auth";
import { getAllEventsAdmin } from "@/lib/data/admin-events";
import { formatDate } from "@/lib/utils";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import { EventRowActions } from "@/components/admin/events/event-row-actions";

export const metadata: Metadata = { title: "Manage Events", robots: { index: false, follow: false } };

const statusVariant = {
  UPCOMING: "success",
  ONGOING: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
} as const;

export default async function AdminEventsPage() {
  await requireManagementAccess();
  const events = await getAllEventsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-nomad-white">Events</h1>
          <p className="mt-1 text-sm text-nomad-ash">Manage rides, registrations, and the ride archive.</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" />
            New Ride
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 px-6 py-16 text-center">
          <CalendarDays className="h-8 w-8 text-nomad-red" />
          <h3 className="font-display text-lg font-semibold text-nomad-white">No Rides Yet</h3>
          <p className="max-w-sm text-sm text-nomad-ash">Create the first ride to open registrations.</p>
          <Button asChild className="mt-2">
            <Link href="/admin/events/new">Create Ride</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col overflow-hidden rounded-lg border border-nomad-steel bg-nomad-charcoal">
              <Link href={`/admin/events/${event.id}`} className="relative block aspect-[16/9] bg-nomad-steel">
                <Image src={event.coverImageUrl} alt={event.title} fill sizes="33vw" className="object-cover" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
                  {!event.registrationOpen && event.status === "UPCOMING" && (
                    <Badge variant="secondary">Registration Closed</Badge>
                  )}
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link href={`/admin/events/${event.id}`}>
                  <h3 className="font-display text-lg font-semibold text-nomad-white hover:text-nomad-red">
                    {event.title}
                  </h3>
                </Link>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-nomad-ash">
                  <span>{formatDate(event.startDate)}</span>
                  <span>&middot;</span>
                  <span>{DIFFICULTY_LABELS[event.difficulty]}</span>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {event._count.registrations}/{event.maxSeats}
                  </span>
                </p>
                <div className="mt-auto pt-2">
                  <EventRowActions eventId={event.id} registrationOpen={event.registrationOpen} status={event.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
