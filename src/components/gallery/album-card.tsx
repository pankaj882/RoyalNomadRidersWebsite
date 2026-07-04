import Image from "next/image";
import Link from "next/link";
import { ImageIcon, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { AlbumWithPreview } from "@/types";

interface AlbumCardProps {
  album: AlbumWithPreview;
  priority?: boolean;
}

export function AlbumCard({ album, priority = false }: AlbumCardProps) {
  const coverImage = album.coverImageUrl ?? album.images[0]?.url;
  const imageCount = album._count?.images ?? album.images.length;

  return (
    <Link
      href={`/gallery/${album.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-nomad-steel bg-nomad-charcoal transition-colors hover:border-nomad-ash"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-nomad-steel">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={album.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-8 w-8 text-nomad-ash" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {album.isFeatured && (
          <Badge className="absolute left-3 top-3">Featured</Badge>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {imageCount} photo{imageCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg font-semibold text-nomad-white transition-colors group-hover:text-nomad-red">
          {album.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-nomad-ash">
          {album.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {album.location}
            </span>
          )}
          {album.rideDate && <span>{formatDate(album.rideDate)}</span>}
        </div>
      </div>
    </Link>
  );
}
