"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManagementAccess } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { deleteGalleryStorageObjects } from "@/lib/supabase/storage";
import {
  albumSchema,
  galleryImageUploadSchema,
  imageEditSchema,
  type AlbumInput,
  type GalleryImageUploadInput,
  type ImageEditInput,
} from "@/lib/validations/gallery";
import type { ActionResult } from "@/types";

/** Generates a unique album slug, appending `-2`, `-3`, etc. on collision. */
async function generateUniqueAlbumSlug(title: string, excludeAlbumId?: string): Promise<string> {
  const base = slugify(title) || "album";
  let candidate = base;
  let suffix = 1;

  // Bounded loop — an album titled the exact same way 500+ times is not a
  // realistic scenario, and this guarantees the function always terminates.
  while (suffix < 500) {
    const existing = await prisma.album.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeAlbumId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now()}`;
}

export async function createAlbumAction(
  input: AlbumInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requireManagementAccess();
  const parsed = albumSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, description, location, rideDate, isFeatured } = parsed.data;
  const slug = await generateUniqueAlbumSlug(title);

  try {
    const album = await prisma.album.create({
      data: {
        title,
        slug,
        description: description || null,
        location: location || null,
        rideDate: rideDate ? new Date(rideDate) : null,
        isFeatured,
        createdById: user.id,
      },
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");

    return { success: true, data: { id: album.id, slug: album.slug }, message: "Album created." };
  } catch (error) {
    console.error("createAlbumAction failed:", error);
    return { success: false, error: "Something went wrong creating the album." };
  }
}

export async function updateAlbumAction(
  albumId: string,
  input: AlbumInput
): Promise<ActionResult<{ slug: string }>> {
  await requireManagementAccess();
  const parsed = albumSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, description, location, rideDate, isFeatured } = parsed.data;

  try {
    const album = await prisma.album.update({
      where: { id: albumId },
      data: {
        title,
        // Slug is intentionally NOT regenerated on edit — changing it would
        // break any external links or bookmarks to this album's public page.
        description: description || null,
        location: location || null,
        rideDate: rideDate ? new Date(rideDate) : null,
        isFeatured,
      },
    });

    revalidatePath("/gallery");
    revalidatePath(`/gallery/${album.slug}`);
    revalidatePath("/admin/gallery");
    revalidatePath(`/admin/gallery/${albumId}`);

    return { success: true, data: { slug: album.slug }, message: "Album updated." };
  } catch (error) {
    console.error("updateAlbumAction failed:", error);
    return { success: false, error: "Something went wrong updating the album." };
  }
}

export async function toggleAlbumFeaturedAction(
  albumId: string,
  isFeatured: boolean
): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  try {
    await prisma.album.update({ where: { id: albumId }, data: { isFeatured } });
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("toggleAlbumFeaturedAction failed:", error);
    return { success: false, error: "Failed to update album." };
  }
}

export async function deleteAlbumAction(albumId: string): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  try {
    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: { images: { select: { storagePath: true } } },
    });

    if (!album) {
      return { success: false, error: "Album not found." };
    }

    const storagePaths = album.images.map((image) => image.storagePath);
    const storageResult = await deleteGalleryStorageObjects(storagePaths);

    if (!storageResult.success) {
      return {
        success: false,
        error: "Could not delete the album's photos from storage. Please try again.",
      };
    }

    // Prisma cascades GalleryImage rows automatically (onDelete: Cascade).
    await prisma.album.delete({ where: { id: albumId } });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");

    return { success: true, data: undefined, message: "Album and all its photos were deleted." };
  } catch (error) {
    console.error("deleteAlbumAction failed:", error);
    return { success: false, error: "Something went wrong deleting the album." };
  }
}

/**
 * Persists Prisma rows for images that have ALREADY been uploaded to
 * Supabase Storage by the client (see `BulkUploader`). Large binary uploads
 * intentionally bypass Server Actions' request body and stream straight
 * from the browser to Storage; this action only writes the resulting
 * metadata to the database.
 */
export async function createGalleryImagesAction(
  input: GalleryImageUploadInput
): Promise<ActionResult<{ createdCount: number }>> {
  const user = await requireManagementAccess();
  const parsed = galleryImageUploadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { albumId, images } = parsed.data;

  try {
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) {
      return { success: false, error: "Album not found." };
    }

    const currentMax = await prisma.galleryImage.aggregate({
      where: { albumId },
      _max: { sortOrder: true },
    });
    let nextSortOrder = (currentMax._max.sortOrder ?? -1) + 1;

    await prisma.$transaction(
      images.map((image) =>
        prisma.galleryImage.create({
          data: {
            albumId,
            storagePath: image.storagePath,
            url: image.url,
            altText: image.altText,
            caption: image.caption || null,
            width: image.width,
            height: image.height,
            sortOrder: nextSortOrder++,
            uploadedById: user.id,
          },
        })
      )
    );

    // Auto-assign the album cover image if it doesn't have one yet.
    if (!album.coverImageUrl && images[0]) {
      await prisma.album.update({
        where: { id: albumId },
        data: { coverImageUrl: images[0].url },
      });
    }

    revalidatePath("/gallery");
    revalidatePath(`/gallery/${album.slug}`);
    revalidatePath(`/admin/gallery/${albumId}`);

    return {
      success: true,
      data: { createdCount: images.length },
      message: `${images.length} photo${images.length === 1 ? "" : "s"} uploaded.`,
    };
  } catch (error) {
    console.error("createGalleryImagesAction failed:", error);
    return { success: false, error: "Something went wrong saving the uploaded photos." };
  }
}

export async function updateImageAction(input: ImageEditInput): Promise<ActionResult<undefined>> {
  await requireManagementAccess();
  const parsed = imageEditSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { imageId, caption, altText } = parsed.data;

  try {
    const image = await prisma.galleryImage.update({
      where: { id: imageId },
      data: { caption: caption || null, altText },
      include: { album: { select: { slug: true } } },
    });

    revalidatePath(`/gallery/${image.album.slug}`);
    revalidatePath(`/admin/gallery/${image.albumId}`);

    return { success: true, data: undefined, message: "Photo updated." };
  } catch (error) {
    console.error("updateImageAction failed:", error);
    return { success: false, error: "Something went wrong updating the photo." };
  }
}

export async function deleteImageAction(imageId: string): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id: imageId },
      include: { album: { select: { id: true, slug: true, coverImageUrl: true } } },
    });

    if (!image) {
      return { success: false, error: "Photo not found." };
    }

    const storageResult = await deleteGalleryStorageObjects([image.storagePath]);
    if (!storageResult.success) {
      return { success: false, error: "Could not delete the photo from storage. Please try again." };
    }

    await prisma.galleryImage.delete({ where: { id: imageId } });

    // If this was the album's cover image, promote the next-oldest image.
    if (image.album.coverImageUrl === image.url) {
      const nextImage = await prisma.galleryImage.findFirst({
        where: { albumId: image.album.id },
        orderBy: { sortOrder: "asc" },
      });
      await prisma.album.update({
        where: { id: image.album.id },
        data: { coverImageUrl: nextImage?.url ?? null },
      });
    }

    revalidatePath(`/gallery/${image.album.slug}`);
    revalidatePath(`/admin/gallery/${image.album.id}`);
    revalidatePath("/gallery");

    return { success: true, data: undefined, message: "Photo deleted." };
  } catch (error) {
    console.error("deleteImageAction failed:", error);
    return { success: false, error: "Something went wrong deleting the photo." };
  }
}

/**
 * Moves an image one position earlier or later within its album by
 * swapping `sortOrder` with its immediate neighbor. Chosen over free-form
 * drag-and-drop reordering because it's keyboard-accessible by default and
 * has no client-side failure modes (no drop-target math, no touch-event
 * edge cases) — a meaningful reliability win for a CMS admins rely on.
 */
export async function moveImageAction(
  imageId: string,
  direction: "up" | "down"
): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id: imageId },
      include: { album: { select: { id: true, slug: true } } },
    });

    if (!image) {
      return { success: false, error: "Photo not found." };
    }

    const neighbor = await prisma.galleryImage.findFirst({
      where: {
        albumId: image.albumId,
        sortOrder: direction === "up" ? { lt: image.sortOrder } : { gt: image.sortOrder },
      },
      orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
    });

    if (!neighbor) {
      return { success: true, data: undefined }; // already at the edge — no-op
    }

    await prisma.$transaction([
      prisma.galleryImage.update({ where: { id: image.id }, data: { sortOrder: neighbor.sortOrder } }),
      prisma.galleryImage.update({ where: { id: neighbor.id }, data: { sortOrder: image.sortOrder } }),
    ]);

    revalidatePath(`/admin/gallery/${image.album.id}`);
    revalidatePath(`/gallery/${image.album.slug}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("moveImageAction failed:", error);
    return { success: false, error: "Something went wrong reordering photos." };
  }
}
