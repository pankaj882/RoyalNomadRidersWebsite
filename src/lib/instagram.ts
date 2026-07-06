import "server-only";

export interface InstagramPost {
  id: string;
  caption?: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  timestamp: string;
}

/**
 * Instagram Graph API has been replaced by Curator.io.
 * This function remains only for compatibility until all
 * callers are migrated.
 */
export async function getInstagramFeed(limit = 8): Promise<InstagramPost[]> {
  return [];
}