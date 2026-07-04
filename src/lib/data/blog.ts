import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface BlogListFilters {
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

const blogCardInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  category: true,
  _count: { select: { comments: true } },
} satisfies Prisma.BlogInclude;

/** Paginated, published blog posts for the public listing page. */
export async function getPublishedBlogs(filters: BlogListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 9;

  const where: Prisma.BlogWhereInput = {
    status: "PUBLISHED",
    ...(filters.q && {
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { excerpt: { contains: filters.q, mode: "insensitive" } },
        { location: { contains: filters.q, mode: "insensitive" } },
      ],
    }),
    ...(filters.category && { category: { slug: filters.category } }),
  };

  const [items, totalItems] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: blogCardInclude,
    }),
    prisma.blog.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  };
}

/** A single published blog post by slug, with its author and category. */
export async function getBlogBySlug(slug: string) {
  const blog = await prisma.blog.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, bio: true } },
      category: true,
    },
  });

  return blog;
}

/** Up to `limit` other published posts in the same category, excluding the current post. */
export async function getRelatedBlogs(blogId: string, categoryId: string | null, limit = 3) {
  if (!categoryId) {
    return prisma.blog.findMany({
      where: { status: "PUBLISHED", id: { not: blogId } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: blogCardInclude,
    });
  }

  return prisma.blog.findMany({
    where: { status: "PUBLISHED", categoryId, id: { not: blogId } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: blogCardInclude,
  });
}

/** All categories, for filter dropdowns and the editor's category select. */
export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

/** All published blog slugs, for generateStaticParams. */
export async function getAllPublishedBlogSlugs(): Promise<string[]> {
  const blogs = await prisma.blog.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return blogs.map((blog) => blog.slug);
}

/** Approved top-level comments (with one level of replies) for a blog post. */
export async function getCommentsForBlog(blogId: string) {
  return prisma.comment.findMany({
    where: { blogId, parentId: null, isApproved: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      replies: {
        where: { isApproved: true },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });
}

/** Whether the given user has already liked a post — powers the like button's initial state. */
export async function hasUserLikedBlog(blogId: string, userId: string): Promise<boolean> {
  const like = await prisma.blogLike.findUnique({
    where: { blogId_userId: { blogId, userId } },
  });
  return !!like;
}
