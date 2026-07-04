import "server-only";
import { prisma } from "@/lib/prisma";

/** All albums for the admin gallery management list, newest first. */
export async function getAllAlbumsAdmin() {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { images: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return albums;
}

/** A single album (with all images, ordered) for the admin edit/manage screen. */
export async function getAlbumForAdmin(albumId: string) {
  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  return album;
}
