import { createClient } from "@/lib/supabase/client";
import { EVENT_MEDIA_BUCKET, getEventMediaPublicUrl, buildEventCoverPath } from "@/lib/event-storage-shared";

export async function uploadEventCoverImage(file: File, eventSlugOrDraftId: string): Promise<string> {
  const supabase = createClient();
  const storagePath = buildEventCoverPath(eventSlugOrDraftId, file.name);

  const { error } = await supabase.storage.from(EVENT_MEDIA_BUCKET).upload(storagePath, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  return getEventMediaPublicUrl(storagePath);
}

export const ACCEPTED_EVENT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_EVENT_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
