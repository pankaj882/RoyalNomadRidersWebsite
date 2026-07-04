import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, ImageIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireManagementAccess } from "@/lib/auth";
import { getAllAlbumsAdmin } from "@/lib/data/admin-gallery";
import { formatDate } from "@/lib/utils";
import { AlbumRowActions } from "@/components/admin/gallery/album-row-actions";

export const metadata: Metadata = { title: "Manage Gallery", robots: { index: false, follow: false } };

export default async function AdminGalleryPage() {
  await requireManagementAccess();
  const albums = await getAllAlbumsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-nomad-white">Gallery</h1>
          <p className="mt-1 text-sm text-nomad-ash">Manage albums and photos across the club gallery.</p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/new">
            <Plus className="h-4 w-4" />
            New Album
          </Link>
        </Button>
      </div>

      {albums.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 px-6 py-16 text-center">
          <ImageIcon className="h-8 w-8 text-nomad-red" />
          <h3 className="font-display text-lg font-semibold text-nomad-white">No Albums Yet</h3>
          <p className="max-w-sm text-sm text-nomad-ash">
            Create your first album to start uploading ride photos.
          </p>
          <Button asChild className="mt-2">
            <Link href="/admin/gallery/new">Create Album</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => {
            const coverImage = album.coverImageUrl ?? album.images[0]?.url;
            return (
              <div
                key={album.id}
                className="flex flex-col overflow-hidden rounded-lg border border-nomad-steel bg-nomad-charcoal"
              >
                <Link href={`/admin/gallery/${album.id}`} className="relative block aspect-[16/10] bg-nomad-steel">
                  {coverImage ? (
                    <Image src={coverImage} alt={album.title} fill sizes="33vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-nomad-ash" />
                    </div>
                  )}
                  {album.isFeatured && (
                    <Badge className="absolute left-3 top-3 flex items-center gap-1">
                      <Star className="h-3 w-3" /> Featured
                    </Badge>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <Link href={`/admin/gallery/${album.id}`}>
                    <h3 className="font-display text-lg font-semibold text-nomad-white hover:text-nomad-red">
                      {album.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-nomad-ash">
                    {album._count.images} photo{album._count.images === 1 ? "" : "s"}
                    {album.location ? ` \u00b7 ${album.location}` : ""}
                    {album.rideDate ? ` \u00b7 ${formatDate(album.rideDate)}` : ""}
                  </p>
                  <div className="mt-auto pt-2">
                    <AlbumRowActions albumId={album.id} isFeatured={album.isFeatured} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
