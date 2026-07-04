import { createClient } from "@/lib/supabase/client";
import {
  BLOG_MEDIA_BUCKET,
  getBlogMediaPublicUrl,
  buildBlogCoverPath,
  buildBlogContentImagePath,
} from "@/lib/blog-storage-shared";

async function uploadToStorage(file: File, storagePath: string): Promise<string> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(BLOG_MEDIA_BUCKET).upload(storagePath, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  return getBlogMediaPublicUrl(storagePath);
}

/** Uploads a blog post's cover image, returning its public URL. */
export async function uploadBlogCoverImage(file: File, blogSlugOrDraftId: string): Promise<string> {
  const storagePath = buildBlogCoverPath(blogSlugOrDraftId, file.name);
  return uploadToStorage(file, storagePath);
}

/** Uploads an image inserted inline into the rich text editor, returning its public URL. */
export async function uploadBlogContentImage(file: File, blogSlugOrDraftId: string): Promise<string> {
  const storagePath = buildBlogContentImagePath(blogSlugOrDraftId, file.name);
  return uploadToStorage(file, storagePath);
}

export const ACCEPTED_BLOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_BLOG_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
