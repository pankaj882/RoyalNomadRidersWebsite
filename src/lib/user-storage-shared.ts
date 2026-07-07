import { slugify } from "@/lib/utils";
import { GALLERY_BUCKET, getGalleryPublicUrl } from "@/lib/gallery-storage-shared";

// User avatar photos reuse the same "gallery" Storage bucket from Phase 3
// (under a `users/avatars/` prefix), same reasoning as blog/event media —
// one bucket, one set of RLS policies, no extra setup required.
export { GALLERY_BUCKET as AVATAR_MEDIA_BUCKET, getGalleryPublicUrl as getAvatarMediaPublicUrl };

export function buildAvatarPath(userId: string, originalFilename: string): string {
  const dotIndex = originalFilename.lastIndexOf(".");
  const ext = dotIndex > -1 ? originalFilename.slice(dotIndex + 1).toLowerCase() : "jpg";
  const baseName = dotIndex > -1 ? originalFilename.slice(0, dotIndex) : originalFilename;
  const safeName = slugify(baseName).slice(0, 40) || "avatar";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `users/avatars/${userId}/${unique}-${safeName}.${ext}`;
}
