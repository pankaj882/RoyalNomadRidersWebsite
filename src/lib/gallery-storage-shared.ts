import { clientEnv } from "@/lib/env";
import { slugify } from "@/lib/utils";

export const GALLERY_BUCKET = "gallery";

/**
 * Builds a collision-resistant storage path for a newly uploaded gallery
 * image: `{albumId}/{timestamp}-{random}-{slugified filename}.{ext}`.
 * Pure string logic — safe to call from the browser before upload.
 */
export function buildGalleryStoragePath(albumId: string, originalFilename: string): string {
  const dotIndex = originalFilename.lastIndexOf(".");
  const ext = dotIndex > -1 ? originalFilename.slice(dotIndex + 1).toLowerCase() : "jpg";
  const baseName = dotIndex > -1 ? originalFilename.slice(0, dotIndex) : originalFilename;
  const safeName = slugify(baseName).slice(0, 60) || "photo";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${albumId}/${unique}-${safeName}.${ext}`;
}

/** Resolves the public URL for a storage path in the gallery bucket. */
export function getGalleryPublicUrl(storagePath: string): string {
  return `${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${GALLERY_BUCKET}/${storagePath}`;
}
