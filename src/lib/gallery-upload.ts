import { createClient } from "@/lib/supabase/client";
import { buildGalleryStoragePath, getGalleryPublicUrl } from "@/lib/gallery-storage-shared";

export interface UploadedGalleryImage {
  storagePath: string;
  url: string;
  altText: string;
  caption?: string;
  width?: number;
  height?: number;
}

/** Reads a browser File's pixel dimensions via an offscreen Image element. */
function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

/**
 * Uploads a single image file directly to the `gallery` Supabase Storage
 * bucket from the browser (bypassing Server Actions' request body so large
 * files don't hit function payload limits), then returns the metadata
 * needed to persist a `GalleryImage` row via `createGalleryImagesAction`.
 */
export async function uploadGalleryImage(
  file: File,
  albumId: string,
  albumTitle: string
): Promise<UploadedGalleryImage> {
  const supabase = createClient();
  const storagePath = buildGalleryStoragePath(albumId, file.name);
  const dimensions = await readImageDimensions(file);

  const { error } = await supabase.storage.from("gallery").upload(storagePath, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  return {
    storagePath,
    url: getGalleryPublicUrl(storagePath),
    altText: `${albumTitle} photo`,
    width: dimensions?.width,
    height: dimensions?.height,
  };
}

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB per photo
