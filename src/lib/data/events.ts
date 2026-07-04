import "server-only";
import { prisma } from "@/lib/prisma";
import type { EventWithAvailability } from "@/types";

function withAvailability(event: { maxSeats: number; _count: { registrations: number } }): number {
  return Math.max(0, event.maxSeats - event._count.registrations);
}

export interface EventListFilters {
  page?: number;
  pageSize?: number;
}

/**
 * Upcoming events for the public list. Filters on `startDate >= now`
 * directly, rather than relying solely on the daily archive cron
 * (`/api/cron/archive-events`) — so an event that started an hour ago never
 * shows as "upcoming" to a visitor even if the cron hasn't run yet today.
 * The cron job's job is to keep the STORED status/isArchived flags (used by
 * the admin dashboard's counts and the dedicated archive view) accurate,
 * not to gate what visitors see in real time.
 */
export async function getUpcomingEventsList(filters: EventListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 9;

  const where = { startDate: { gte: new Date() }, status: { not: "CANCELLED" as const } };

  const [items, totalItems] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.event.count({ where }),
  ]);

  const eventsWithAvailability: EventWithAvailability[] = items.map((event) => ({
    ...event,
    seatsRemaining: withAvailability(event),
  }));

  return {
    items: eventsWithAvailability,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  };
}

/** Past events (by date, same real-time logic as above) for the public archive view. */
export async function getPastEventsList(filters: EventListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 9;

  const where = { startDate: { lt: new Date() } };

  const [items, totalItems] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.event.count({ where }),
  ]);

  const eventsWithAvailability: EventWithAvailability[] = items.map((event) => ({
    ...event,
    seatsRemaining: withAvailability(event),
  }));

  return {
    items: eventsWithAvailability,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  };
}

/** A single event by slug, with live seat availability, for the detail + registration page. */
export async function getEventBySlug(slug: string): Promise<EventWithAvailability | null> {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) return null;

  return { ...event, seatsRemaining: withAvailability(event) };
}

/** All event slugs, for generateStaticParams. */
export async function getAllEventSlugs(): Promise<string[]> {
  const events = await prisma.event.findMany({ select: { slug: true } });
  return events.map((event) => event.slug);
}
