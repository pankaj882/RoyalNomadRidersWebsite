import "server-only";
import { prisma } from "@/lib/prisma";
import type { BlogWithRelations, EventWithAvailability, AlbumWithPreview } from "@/types";

/** Most recent published blog post, used for the "Latest Ride" homepage section. */
export async function getLatestRide(): Promise<BlogWithRelations | null> {
  const blog = await prisma.blog.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      category: true,
      _count: { select: { comments: true } },
    },
  });

  return blog;
}

/** Up to `limit` upcoming, non-archived events ordered by soonest start date. */
export async function getUpcomingEvents(limit = 3): Promise<EventWithAvailability[]> {
  const events = await prisma.event.findMany({
    where: { status: "UPCOMING", isArchived: false, registrationOpen: true },
    orderBy: { startDate: "asc" },
    take: limit,
    include: { _count: { select: { registrations: true } } },
  });

  return events.map((event) => ({
    ...event,
    seatsRemaining: Math.max(0, event.maxSeats - event._count.registrations),
  }));
}

/** Up to `limit` most recently published blog posts, excluding the latest ride already featured. */
export async function getRecentBlogs(limit = 3, excludeId?: string): Promise<BlogWithRelations[]> {
  const blogs = await prisma.blog.findMany({
    where: {
      status: "PUBLISHED",
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      category: true,
      _count: { select: { comments: true } },
    },
  });

  return blogs;
}

/** A flat preview of the most recent gallery images across all albums, newest first. */
export async function getGalleryPreview(limit = 8) {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { album: { select: { title: true, slug: true } } },
  });

  return images;
}

/** The most recently created album with a small preview of its images, for a "Featured Album" card. */
export async function getFeaturedAlbum(): Promise<AlbumWithPreview | null> {
  const album = await prisma.album.findFirst({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 5 },
      _count: { select: { images: true } },
    },
  });

  return album;
}

export interface RideStats {
  totalRiders: number;
  totalRides: number;
  totalDistanceKm: number;
  yearsOnTheRoad: number;
}

/** Aggregate club statistics computed live from the database. */
export async function getRideStats(): Promise<RideStats> {
  const [totalRiders, totalRides, distanceAgg] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.event.count({ where: { status: "COMPLETED" } }),
    prisma.blog.aggregate({ _sum: { distanceKm: true }, where: { status: "PUBLISHED" } }),
  ]);

  const foundingYear = 2018;

  return {
    totalRiders,
    totalRides,
    totalDistanceKm: distanceAgg._sum.distanceKm ?? 0,
    yearsOnTheRoad: new Date().getFullYear() - foundingYear,
  };
}

/** Approved, featured testimonials for the homepage social-proof section. */
export async function getFeaturedTestimonials(limit = 6) {
  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true, isFeatured: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });

  return testimonials;
}
