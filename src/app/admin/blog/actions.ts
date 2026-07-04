"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/auth";
import { slugify, estimateReadingTime } from "@/lib/utils";
import { sanitizeBlogContent, stripHtml } from "@/lib/sanitize-html";
import { MANAGEMENT_ROLES } from "@/lib/constants";
import { blogSchema, type BlogInput } from "@/lib/validations/blog";
import type { ActionResult } from "@/types";

/** Generates a unique blog slug, appending `-2`, `-3`, etc. on collision. */
async function generateUniqueBlogSlug(title: string, excludeBlogId?: string): Promise<string> {
  const base = slugify(title) || "post";
  let candidate = base;
  let suffix = 1;

  while (suffix < 500) {
    const existing = await prisma.blog.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeBlogId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now()}`;
}

/** Throws (via redirect, inside requireAdminAccess) unless the user can edit this specific post. */
function assertCanEditBlog(userRole: string, userId: string, authorId: string) {
  const isManagement = MANAGEMENT_ROLES.includes(userRole as (typeof MANAGEMENT_ROLES)[number]);
  if (!isManagement && authorId !== userId) {
    throw new Error("You don't have permission to edit this post.");
  }
}

export async function createBlogAction(
  input: BlogInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requireAdminAccess();
  const parsed = blogSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const slug = await generateUniqueBlogSlug(data.title);
  const cleanContent = sanitizeBlogContent(data.content);
  const readingTimeMin = estimateReadingTime(stripHtml(cleanContent));

  try {
    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: cleanContent,
        coverImageUrl: data.coverImageUrl,
        authorId: user.id,
        categoryId: data.categoryId || null,
        rideDate: data.rideDate ? new Date(data.rideDate) : null,
        location: data.location || null,
        motorcycle: data.motorcycle || null,
        distanceKm: data.distanceKm ?? null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        readingTimeMin,
        status: "DRAFT",
      },
    });

    revalidatePath("/admin/blog");

    return { success: true, data: { id: blog.id, slug: blog.slug }, message: "Draft saved." };
  } catch (error) {
    console.error("createBlogAction failed:", error);
    return { success: false, error: "Something went wrong saving the post." };
  }
}

export async function updateBlogAction(
  blogId: string,
  input: BlogInput
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireAdminAccess();
  const parsed = blogSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing) {
      return { success: false, error: "Post not found." };
    }
    assertCanEditBlog(user.role, user.id, existing.authorId);

    const data = parsed.data;
    const cleanContent = sanitizeBlogContent(data.content);
    const readingTimeMin = estimateReadingTime(stripHtml(cleanContent));

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title: data.title,
        // Slug is NOT regenerated on edit — see the identical decision for
        // Album slugs in src/app/admin/gallery/actions.ts.
        excerpt: data.excerpt,
        content: cleanContent,
        coverImageUrl: data.coverImageUrl,
        categoryId: data.categoryId || null,
        rideDate: data.rideDate ? new Date(data.rideDate) : null,
        location: data.location || null,
        motorcycle: data.motorcycle || null,
        distanceKm: data.distanceKm ?? null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        readingTimeMin,
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${blogId}`);
    if (blog.status === "PUBLISHED") {
      revalidatePath("/blog");
      revalidatePath(`/blog/${blog.slug}`);
    }

    return { success: true, data: { slug: blog.slug }, message: "Post updated." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong updating the post.";
    console.error("updateBlogAction failed:", error);
    return { success: false, error: message };
  }
}

export async function publishBlogAction(blogId: string): Promise<ActionResult<{ slug: string }>> {
  const user = await requireAdminAccess();

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing) return { success: false, error: "Post not found." };
    assertCanEditBlog(user.role, user.id, existing.authorId);

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        status: "PUBLISHED",
        publishedAt: existing.publishedAt ?? new Date(),
      },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${blog.slug}`);

    return { success: true, data: { slug: blog.slug }, message: "Post published." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong publishing the post.";
    console.error("publishBlogAction failed:", error);
    return { success: false, error: message };
  }
}

export async function unpublishBlogAction(blogId: string): Promise<ActionResult<undefined>> {
  const user = await requireAdminAccess();

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing) return { success: false, error: "Post not found." };
    assertCanEditBlog(user.role, user.id, existing.authorId);

    await prisma.blog.update({ where: { id: blogId }, data: { status: "DRAFT" } });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${existing.slug}`);

    return { success: true, data: undefined, message: "Post moved back to draft." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    console.error("unpublishBlogAction failed:", error);
    return { success: false, error: message };
  }
}

export async function archiveBlogAction(blogId: string): Promise<ActionResult<undefined>> {
  const user = await requireAdminAccess();

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing) return { success: false, error: "Post not found." };
    assertCanEditBlog(user.role, user.id, existing.authorId);

    await prisma.blog.update({ where: { id: blogId }, data: { status: "ARCHIVED" } });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${existing.slug}`);

    return { success: true, data: undefined, message: "Post archived." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    console.error("archiveBlogAction failed:", error);
    return { success: false, error: message };
  }
}

export async function deleteBlogAction(blogId: string): Promise<ActionResult<undefined>> {
  const user = await requireAdminAccess();

  try {
    const existing = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!existing) return { success: false, error: "Post not found." };
    assertCanEditBlog(user.role, user.id, existing.authorId);

    // Comments and likes cascade automatically (onDelete: Cascade in schema).
    // NOTE: cover/inline images uploaded to Storage for this post are NOT
    // automatically deleted — see README "Phase 4 Notes" for the documented
    // cleanup trade-off (content images are referenced by arbitrary,
    // unstructured HTML, making safe garbage collection a job better suited
    // to a periodic cleanup script than a synchronous delete action).
    await prisma.blog.delete({ where: { id: blogId } });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return { success: true, data: undefined, message: "Post deleted." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong deleting the post.";
    console.error("deleteBlogAction failed:", error);
    return { success: false, error: message };
  }
}
