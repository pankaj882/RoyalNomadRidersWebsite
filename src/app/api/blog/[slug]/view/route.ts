import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    await prisma.blog.updateMany({
      where: { slug, status: "PUBLISHED" },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to increment view count:", error);
    // Never surface this as a hard failure to the client — a missed view
    // count increment isn't worth showing the reader an error.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
