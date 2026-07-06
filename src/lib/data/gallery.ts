import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface AlbumListFilters {
  q?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Paginated albums for the public gallery grid, newest/featured first, with
 * a small image preview each. Powers infinite scroll on `/gallery`
 * (`InfiniteAlbumGrid` renders page 1 server-side for SEO/no-JS baseline,
 * then fetches subsequent pages from `/api/gallery/albums`).
 */
export async function getAlbums(filters: AlbumListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 12;

  const where: Prisma.AlbumWhereInput = {
    ...(filters.q && {
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { location: { contains: filters.q, mode: "insensitive" } },
      ],
    }),
    ...(filters.location && { location: { equals: filters.location, mode: "insensitive" } }),
  };

  const [items, totalItems] = await Promise.all([
    prisma.album.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 4 },
        _count: { select: { images: true } },
      },
    }),
    prisma.album.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  };
}

/** Distinct, non-empty album locations — powers the gallery filter dropdown. */
export async function getAlbumLocations(): Promise<string[]> {
  const rows = await prisma.album.findMany({
    where: { location: { not: null } },
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });

  return rows.map((row) => row.location).filter((location): location is string => !!location);
}

/** A single album with all of its images, for the album detail / lightbox page. */
export async function getAlbumBySlug(slug: string) {
  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return album;
}

/** All album slugs, used by generateStaticParams for build-time prerendering. */
export async function getAllAlbumSlugs(): Promise<string[]> {
  const albums = await prisma.album.findMany({ select: { slug: true } });
  return albums.map((album) => album.slug);
}
