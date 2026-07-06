import { NextResponse, type NextRequest } from "next/server";
import { getAlbums } from "@/lib/data/gallery";

// Cached at the edge for a short window — album listings don't need to be
// second-fresh, and this keeps repeated infinite-scroll requests (the same
// page, requested by many visitors) cheap.
export const revalidate = 120;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const q = searchParams.get("q") ?? undefined;
  const location = searchParams.get("location") ?? undefined;

  const result = await getAlbums({ page, q, location });

  return NextResponse.json(result);
}
