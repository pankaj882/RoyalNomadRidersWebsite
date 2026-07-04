import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, Role } from "@prisma/client";
import { MANAGEMENT_ROLES } from "@/lib/constants";

export interface AdminBlogListFilters {
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

/**
 * All blogs visible to the given user for the admin list: Admins and Super
 * Admins see every post, Blog Authors see only their own — enforced here at
 * the query level rather than filtered client-side, so a Blog Author's
 * dashboard never even receives other authors' drafts over the wire.
 */
export async function getBlogsForAdmin(
  userId: string,
  userRole: Role,
  filters: AdminBlogListFilters = {}
) {
  const canSeeAll = MANAGEMENT_ROLES.includes(userRole);

  const where: Prisma.BlogWhereInput = {
    ...(filters.status && { status: filters.status }),
    ...(!canSeeAll && { authorId: userId }),
  };

  return prisma.blog.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      category: true,
      _count: { select: { comments: true } },
    },
  });
}

/** A single blog (any status) for the admin editor, including its ID owner for ownership checks. */
export async function getBlogForAdmin(blogId: string) {
  return prisma.blog.findUnique({
    where: { id: blogId },
    include: { category: true },
  });
}
