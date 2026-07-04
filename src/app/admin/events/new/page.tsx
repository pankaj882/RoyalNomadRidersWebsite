import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/events/event-form";
import { requireManagementAccess } from "@/lib/auth";

export const metadata: Metadata = { title: "New Ride", robots: { index: false, follow: false } };

export default async function NewEventPage() {
  await requireManagementAccess();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/events" className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">New Ride</h1>
        <p className="mt-1 text-sm text-nomad-ash">Set up a new ride and open registrations.</p>
      </div>

      <EventForm />
    </div>
  );
}
