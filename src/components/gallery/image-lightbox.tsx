"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { GalleryImage } from "@/types";

interface ImageLightboxProps {
  images: GalleryImage[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({ images, initialIndex, open, onOpenChange }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [open, initialIndex]);

  const goToNext = useCallback(() => {
    setIsZoomed(false);
    setIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setIsZoomed(false);
    setIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goToNext();
      if (event.key === "ArrowLeft") goToPrevious();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToNext, goToPrevious]);

  async function handleShare(image: GalleryImage) {
    const shareUrl = image.url;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: image.caption ?? image.altText, url: shareUrl });
      } catch {
        // User cancelled the native share sheet — no action needed.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Image link copied to clipboard.");
    } catch {
      toast.error("Couldn't copy the link. Try again.");
    }
  }

  if (images.length === 0) return null;
  const currentImage = images[index]!;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[60] flex flex-col outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="sr-only">
            {currentImage.caption ?? currentImage.altText}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Photo {index + 1} of {images.length}
          </DialogPrimitive.Description>

          {/* Top bar */}
          <div className="flex items-center justify-between p-4 sm:p-6">
            <span className="text-sm text-white/70">
              {index + 1} / {images.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed((z) => !z)}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => handleShare(currentImage)}
                aria-label="Share this photo"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Image stage */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4 sm:px-16">
            {images.length > 1 && (
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div
              className={`relative h-full w-full transition-transform duration-300 ${
                isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onClick={() => setIsZoomed((z) => !z)}
            >
              <Image
                src={currentImage.url}
                alt={currentImage.altText}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {currentImage.caption && (
            <p className="px-6 pb-6 text-center text-sm text-white/80">{currentImage.caption}</p>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
