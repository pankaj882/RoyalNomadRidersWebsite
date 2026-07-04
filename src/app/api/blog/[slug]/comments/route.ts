import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCommentsForBlog } from "@/lib/data/blog";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });
  if (!blog) {
    return NextResponse.json({ comments: [] });
  }

  const comments = await getCommentsForBlog(blog.id);
  return NextResponse.json({ comments });
}
