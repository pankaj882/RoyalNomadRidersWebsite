"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EditImageDialog } from "@/components/admin/gallery/edit-image-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { moveImageAction, deleteImageAction } from "@/app/admin/gallery/actions";
import type { GalleryImage } from "@/types";

interface ImageManagerGridProps {
  images: GalleryImage[];
}

export function ImageManagerGrid({ images }: ImageManagerGridProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleMove(imageId: string, direction: "up" | "down") {
    setPendingId(imageId);
    const result = await moveImageAction(imageId, direction);
    setPendingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete(imageId: string) {
    const result = await deleteImageAction(imageId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Photo deleted.");
    router.refresh();
  }

  if (images.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 p-8 text-center text-sm text-nomad-ash">
        No photos uploaded to this album yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image, index) => (
        <div key={image.id} className="group relative overflow-hidden rounded-lg border border-nomad-steel">
          <div className="relative aspect-square w-full bg-nomad-steel">
            <Image
              src={image.url}
              alt={image.altText}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/50 via-transparent to-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex justify-end gap-1.5">
              <EditImageDialog image={image} />
              <ConfirmDialog
                trigger={
                  <button
                    type="button"
                    aria-label="Delete photo"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                }
                title="Delete this photo?"
                description="This permanently removes the photo from the album and deletes the file from storage."
                confirmLabel="Delete Photo"
                onConfirm={() => handleDelete(image.id)}
              />
            </div>

            <div className="flex items-center justify-between gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                disabled={index === 0 || pendingId === image.id}
                onClick={() => handleMove(image.id, "up")}
                aria-label="Move earlier"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {image.caption && (
                <span className="min-w-0 truncate rounded bg-black/60 px-2 py-1 text-[0.65rem] text-white">
                  {image.caption}
                </span>
              )}
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                disabled={index === images.length - 1 || pendingId === image.id}
                onClick={() => handleMove(image.id, "down")}
                aria-label="Move later"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
