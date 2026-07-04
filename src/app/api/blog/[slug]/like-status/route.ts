import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ liked: false });
  }

  const blog = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });
  if (!blog) {
    return NextResponse.json({ liked: false });
  }

  const like = await prisma.blogLike.findUnique({
    where: { blogId_userId: { blogId: blog.id, userId: user.id } },
  });

  return NextResponse.json({ liked: !!like });
}
