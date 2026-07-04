import "server-only";
import { prisma } from "@/lib/prisma";

/** All events for the admin list, newest start date first. */
export async function getAllEventsAdmin() {
  return prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { registrations: true } } },
  });
}

/** A single event (any status) for the admin edit screen. */
export async function getEventForAdmin(eventId: string) {
  return prisma.event.findUnique({ where: { id: eventId } });
}

/** All registrations for an event, newest first — for the admin registrations table and CSV export. */
export async function getRegistrationsForEvent(eventId: string) {
  return prisma.registration.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });
}
