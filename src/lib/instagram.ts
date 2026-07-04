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

interface InstagramApiMediaItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramApiResponse {
  data: InstagramApiMediaItem[];
}

const INSTAGRAM_GRAPH_API_BASE = "https://graph.instagram.com/me/media";
const INSTAGRAM_FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

/**
 * Fetches the club's most recent Instagram posts via the Instagram Graph API
 * (requires a connected Instagram Business/Creator account and a long-lived
 * access token in `INSTAGRAM_ACCESS_TOKEN`).
 *
 * Returns an empty array — never throws — when the token isn't configured or
 * the request fails, so the homepage section can render a graceful "connect
 * Instagram" empty state instead of crashing the page.
 */
export async function getInstagramFeed(limit = 8): Promise<InstagramPost[]> {
  const { serverEnv } = await import("@/lib/env.server");
  const accessToken = serverEnv.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return [];
  }

  try {
    const url = `${INSTAGRAM_GRAPH_API_BASE}?fields=${INSTAGRAM_FIELDS}&limit=${limit}&access_token=${accessToken}`;

    // Revalidate every hour — Instagram content doesn't need to be
    // second-fresh, and this keeps us well within free-tier API quotas.
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      console.error("Instagram API error:", response.status, await response.text());
      return [];
    }

    const json: InstagramApiResponse = await response.json();

    return json.data
      .filter((item) => item.media_type !== "VIDEO" || !!item.thumbnail_url)
      .map((item) => ({
        id: item.id,
        caption: item.caption,
        mediaType: item.media_type,
        mediaUrl: item.media_type === "VIDEO" ? item.thumbnail_url ?? item.media_url : item.media_url,
        thumbnailUrl: item.thumbnail_url,
        permalink: item.permalink,
        timestamp: item.timestamp,
      }));
  } catch (error) {
    console.error("Failed to fetch Instagram feed:", error);
    return [];
  }
}
