import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AlbumForm } from "@/components/admin/gallery/album-form";
import { BulkUploader } from "@/components/admin/gallery/bulk-uploader";
import { ImageManagerGrid } from "@/components/admin/gallery/image-manager-grid";
import { requireManagementAccess } from "@/lib/auth";
import { getAlbumForAdmin } from "@/lib/data/admin-gallery";

export const metadata: Metadata = { title: "Manage Album", robots: { index: false, follow: false } };

interface ManageAlbumPageProps {
  params: Promise<{ albumId: string }>;
}

export default async function ManageAlbumPage({ params }: ManageAlbumPageProps) {
  await requireManagementAccess();
  const { albumId } = await params;
  const album = await getAlbumForAdmin(albumId);

  if (!album) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link href="/admin/gallery" className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
        <Link
          href={`/gallery/${album.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white"
        >
          View Public Page <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">{album.title}</h1>
        <p className="mt-1 text-sm text-nomad-ash">
          {album.images.length} photo{album.images.length === 1 ? "" : "s"} in this album
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-nomad-white">Upload Photos</h2>
        <BulkUploader albumId={album.id} albumTitle={album.title} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-nomad-white">Photos</h2>
        <p className="text-xs text-nomad-ash">
          Use the arrows to reorder, the pencil to edit a caption, and the trash icon to remove a photo.
        </p>
        <ImageManagerGrid images={album.images} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-nomad-white">Album Details</h2>
        <div className="max-w-2xl rounded-xl border border-nomad-steel bg-nomad-charcoal p-6 sm:p-8">
          <AlbumForm album={album} />
        </div>
      </section>
    </div>
  );
}
