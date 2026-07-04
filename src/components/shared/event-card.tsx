import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Gauge, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDistance } from "@/lib/utils";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import type { EventWithAvailability } from "@/types";

interface EventCardProps {
  event: EventWithAvailability;
  priority?: boolean;
}

const difficultyVariant: Record<EventWithAvailability["difficulty"], "success" | "secondary" | "warning" | "destructive"> = {
  EASY: "success",
  MODERATE: "secondary",
  CHALLENGING: "warning",
  EXTREME: "destructive",
};

export function EventCard({ event, priority = false }: EventCardProps) {
  const seatsLow = event.seatsRemaining > 0 && event.seatsRemaining <= 5;
  const isFull = event.seatsRemaining <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-nomad-steel bg-nomad-charcoal transition-colors hover:border-nomad-ash">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-nomad-steel">
        <Image
          src={event.coverImageUrl}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge variant={difficultyVariant[event.difficulty]} className="absolute left-3 top-3">
          {DIFFICULTY_LABELS[event.difficulty]}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-nomad-white">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-nomad-ash">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {event.destination}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {formatDate(event.startDate)}
            {event.endDate ? ` \u2013 ${formatDate(event.endDate)}` : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 shrink-0" />
            {formatDistance(event.distanceKm)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              isFull ? "text-red-400" : seatsLow ? "text-amber-400" : "text-nomad-ash"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            {isFull ? "Seats Full" : `${event.seatsRemaining} seats left`}
          </span>
          <Button asChild size="sm" disabled={isFull}>
            <Link href={`/events/${event.slug}`}>{isFull ? "Waitlist" : "Register Now"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
