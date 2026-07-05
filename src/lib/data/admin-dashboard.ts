import "server-only";
import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  galleryImageCount: number;
  albumCount: number;
  publishedBlogCount: number;
  draftBlogCount: number;
  upcomingEventCount: number;
  totalRegistrations: number;
  waitlistedRegistrations: number;
  activeUserCount: number;
  newContactCount: number;
}

/** Headline counts for the dashboard's stat cards, fetched in parallel. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    galleryImageCount,
    albumCount,
    publishedBlogCount,
    draftBlogCount,
    upcomingEventCount,
    totalRegistrations,
    waitlistedRegistrations,
    activeUserCount,
    newContactCount,
  ] = await Promise.all([
    prisma.galleryImage.count(),
    prisma.album.count(),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
    prisma.blog.count({ where: { status: "DRAFT" } }),
    prisma.event.count({ where: { status: "UPCOMING", isArchived: false } }),
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "WAITLISTED" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.contact.count({ where: { status: "NEW" } }),
  ]);

  return {
    galleryImageCount,
    albumCount,
    publishedBlogCount,
    draftBlogCount,
    upcomingEventCount,
    totalRegistrations,
    waitlistedRegistrations,
    activeUserCount,
    newContactCount,
  };
}

/** Most recent registrations across all events, for the dashboard activity list. */
export async function getRecentRegistrations(limit = 6) {
  return prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { event: { select: { id: true, title: true, slug: true } } },
  });
}

/** Most recently updated blog posts (any status), for the dashboard activity list. */
export async function getRecentBlogsAdmin(limit = 6) {
  return prisma.blog.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { author: { select: { name: true } } },
  });
}

/** Soonest upcoming events, for the dashboard activity list. */
export async function getUpcomingEventsAdmin(limit = 5) {
  const events = await prisma.event.findMany({
    where: { status: "UPCOMING", isArchived: false },
    orderBy: { startDate: "asc" },
    take: limit,
    include: { _count: { select: { registrations: true } } },
  });

  return events.map((event) => ({
    ...event,
    seatsRemaining: Math.max(0, event.maxSeats - event._count.registrations),
  }));
}
