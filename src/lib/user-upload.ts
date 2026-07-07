import { createClient } from "@/lib/supabase/client";
import { AVATAR_MEDIA_BUCKET, getAvatarMediaPublicUrl, buildAvatarPath } from "@/lib/user-storage-shared";

export async function uploadUserAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  const storagePath = buildAvatarPath(userId, file.name);

  const { error } = await supabase.storage.from(AVATAR_MEDIA_BUCKET).upload(storagePath, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  return getAvatarMediaPublicUrl(storagePath);
}

export const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
