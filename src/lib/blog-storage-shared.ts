import { slugify } from "@/lib/utils";
import { GALLERY_BUCKET, getGalleryPublicUrl } from "@/lib/gallery-storage-shared";

// Blog images reuse the same "gallery" Storage bucket created in Phase 3
// (under a `blog/` prefix) rather than requiring a second bucket + a
// duplicate set of RLS policies — one less manual setup step for whoever
// deploys this project. The bucket name constant and public-URL resolver
// are the same ones Phase 3's gallery feature uses.
export { GALLERY_BUCKET as BLOG_MEDIA_BUCKET, getGalleryPublicUrl as getBlogMediaPublicUrl };

function buildPath(prefix: string, originalFilename: string): string {
  const dotIndex = originalFilename.lastIndexOf(".");
  const ext = dotIndex > -1 ? originalFilename.slice(dotIndex + 1).toLowerCase() : "jpg";
  const baseName = dotIndex > -1 ? originalFilename.slice(0, dotIndex) : originalFilename;
  const safeName = slugify(baseName).slice(0, 60) || "image";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${prefix}/${unique}-${safeName}.${ext}`;
}

/** Storage path for a blog post's cover image. */
export function buildBlogCoverPath(blogSlugOrDraftId: string, originalFilename: string): string {
  return buildPath(`blog/covers/${blogSlugOrDraftId}`, originalFilename);
}

/** Storage path for an image inserted inline into the rich text editor. */
export function buildBlogContentImagePath(blogSlugOrDraftId: string, originalFilename: string): string {
  return buildPath(`blog/content/${blogSlugOrDraftId}`, originalFilename);
}
