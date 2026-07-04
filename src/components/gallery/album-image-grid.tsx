"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { ImageLightbox } from "@/components/gallery/image-lightbox";
import type { GalleryImage } from "@/types";

interface AlbumImageGridProps {
  images: GalleryImage[];
}

export function AlbumImageGrid({ images }: AlbumImageGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-square w-full overflow-hidden rounded-md bg-nomad-steel text-left"
            aria-label={`Open photo: ${image.altText}`}
          >
            <Image
              src={image.url}
              alt={image.altText}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              // Lazy-load every image below the fold; the browser's native
              // `loading="lazy"` (Next's default for non-priority images)
              // keeps initial page weight low for large albums.
              loading={index < 6 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
              <Expand className="h-5 w-5 text-white" />
            </div>
          </button>
        ))}
      </div>

      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onOpenChange={(isOpen) => setLightboxIndex(isOpen ? lightboxIndex : null)}
      />
    </>
  );
}
