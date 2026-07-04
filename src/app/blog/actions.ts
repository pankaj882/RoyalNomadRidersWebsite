"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { commentSchema, type CommentInput } from "@/lib/validations/blog";
import { ADMIN_ROLES } from "@/lib/constants";
import type { ActionResult } from "@/types";

/**
 * Toggles the current user's like on a post. Uses the `BlogLike` unique
 * constraint (`blogId_userId`) as the source of truth and keeps
 * `Blog.likeCount` in sync transactionally, so the denormalized counter can
 * never drift from the actual number of like rows.
 */
export async function toggleLikeAction(
  blogId: string,
  blogSlug: string
): Promise<ActionResult<{ liked: boolean; likeCount: number }>> {
  const user = await requireUser(`/blog/${blogSlug}`);

  try {
    const existing = await prisma.blogLike.findUnique({
      where: { blogId_userId: { blogId, userId: user.id } },
    });

    const [, blog] = existing
      ? await prisma.$transaction([
          prisma.blogLike.delete({ where: { id: existing.id } }),
          prisma.blog.update({ where: { id: blogId }, data: { likeCount: { decrement: 1 } } }),
        ])
      : await prisma.$transaction([
          prisma.blogLike.create({ data: { blogId, userId: user.id } }),
          prisma.blog.update({ where: { id: blogId }, data: { likeCount: { increment: 1 } } }),
        ]);

    revalidatePath(`/blog/${blogSlug}`);

    return { success: true, data: { liked: !existing, likeCount: blog.likeCount } };
  } catch (error) {
    console.error("toggleLikeAction failed:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function createCommentAction(input: CommentInput): Promise<ActionResult<undefined>> {
  const user = await requireUser();
  const parsed = commentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const rateLimit = await checkRateLimit({
    key: `comment:${user.id}`,
    limit: 10,
    windowSeconds: 3600,
  });

  if (!rateLimit.success) {
    return { success: false, error: "You're commenting a lot — please slow down and try again later." };
  }

  const { blogId, content, parentId } = parsed.data;

  try {
    const blog = await prisma.blog.findUnique({ where: { id: blogId }, select: { slug: true, status: true } });
    if (!blog || blog.status !== "PUBLISHED") {
      return { success: false, error: "This post isn't available for comments." };
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { blogId: true, parentId: true },
      });
      if (!parent || parent.blogId !== blogId) {
        return { success: false, error: "Invalid reply target." };
      }
      if (parent.parentId) {
        return { success: false, error: "Replies can only be added to top-level comments." };
      }
    }

    await prisma.comment.create({
      data: { blogId, authorId: user.id, content, parentId: parentId || null },
    });

    revalidatePath(`/blog/${blog.slug}`);

    return { success: true, data: undefined, message: "Comment posted." };
  } catch (error) {
    console.error("createCommentAction failed:", error);
    return { success: false, error: "Something went wrong posting your comment." };
  }
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult<undefined>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { blog: { select: { slug: true } } },
    });

    if (!comment) return { success: false, error: "Comment not found." };

    const canDelete = comment.authorId === user.id || ADMIN_ROLES.includes(user.role);
    if (!canDelete) {
      return { success: false, error: "You don't have permission to delete this comment." };
    }

    // The Comment self-relation (parent/replies) uses onDelete: NoAction —
    // Postgres would otherwise reject deleting a comment that still has
    // replies pointing at it. We enforce single-level nesting at creation
    // time (see createCommentAction), so a comment has at most direct
    // replies, never deeper; delete those first, then the comment itself.
    await prisma.comment.deleteMany({ where: { parentId: commentId } });
    await prisma.comment.delete({ where: { id: commentId } });

    revalidatePath(`/blog/${comment.blog.slug}`);

    return { success: true, data: undefined, message: "Comment deleted." };
  } catch (error) {
    console.error("deleteCommentAction failed:", error);
    return { success: false, error: "Something went wrong deleting the comment." };
  }
}
