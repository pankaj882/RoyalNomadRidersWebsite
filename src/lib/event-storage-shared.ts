import { slugify } from "@/lib/utils";
import { GALLERY_BUCKET, getGalleryPublicUrl } from "@/lib/gallery-storage-shared";

// Event cover images reuse the same "gallery" Storage bucket from Phase 3
// (under an `events/` prefix), same reasoning as blog media in Phase 4 —
// one bucket, one set of RLS policies, no extra setup for whoever deploys.
export { GALLERY_BUCKET as EVENT_MEDIA_BUCKET, getGalleryPublicUrl as getEventMediaPublicUrl };

export function buildEventCoverPath(eventSlugOrDraftId: string, originalFilename: string): string {
  const dotIndex = originalFilename.lastIndexOf(".");
  const ext = dotIndex > -1 ? originalFilename.slice(dotIndex + 1).toLowerCase() : "jpg";
  const baseName = dotIndex > -1 ? originalFilename.slice(0, dotIndex) : originalFilename;
  const safeName = slugify(baseName).slice(0, 60) || "cover";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `events/${eventSlugOrDraftId}/${unique}-${safeName}.${ext}`;
}
