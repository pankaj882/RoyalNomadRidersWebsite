import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { EventForm } from "@/components/admin/events/event-form";
import { RegistrationsTable } from "@/components/admin/events/registrations-table";
import { requireManagementAccess } from "@/lib/auth";
import { getEventForAdmin, getRegistrationsForEvent } from "@/lib/data/admin-events";

export const metadata: Metadata = { title: "Manage Ride", robots: { index: false, follow: false } };

interface ManageEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function ManageEventPage({ params }: ManageEventPageProps) {
  await requireManagementAccess();
  const { eventId } = await params;
  const event = await getEventForAdmin(eventId);

  if (!event) {
    notFound();
  }

  const registrations = await getRegistrationsForEvent(eventId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link href="/admin/events" className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <Link
          href={`/events/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white"
        >
          View Public Page <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">{event.title}</h1>
      </div>

      <section className="flex flex-col gap-4">
        <RegistrationsTable eventId={event.id} registrations={registrations} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-nomad-white">Ride Details</h2>
        <EventForm event={event} />
      </section>
    </div>
  );
}
