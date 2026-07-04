import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { EventWithAvailability } from "@/types";

interface PastEventCardProps {
  event: EventWithAvailability;
}

export function PastEventCard({ event }: PastEventCardProps) {
  const ridersJoined = event.maxSeats - event.seatsRemaining;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-nomad-steel bg-nomad-black opacity-90 transition-opacity hover:opacity-100"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-nomad-steel grayscale-[40%] transition-all group-hover:grayscale-0">
        <Image src={event.coverImageUrl} alt={event.title} fill sizes="33vw" className="object-cover" />
        <Badge variant="secondary" className="absolute left-3 top-3">
          {event.status === "CANCELLED" ? "Cancelled" : "Completed"}
        </Badge>
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-semibold text-nomad-white group-hover:text-nomad-red">
          {event.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-nomad-ash">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {event.destination}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {formatDate(event.startDate)}
          </span>
          {ridersJoined > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {ridersJoined} rider{ridersJoined === 1 ? "" : "s"} joined
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
