import { z } from "zod";

export const albumSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title must be under 120 characters"),
  description: z
    .string()
    .max(1000, "Description must be under 1000 characters")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(120, "Location must be under 120 characters")
    .optional()
    .or(z.literal("")),
  rideDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), {
      message: "Enter a valid date",
    }),
  isFeatured: z.boolean().default(false),
});

export type AlbumInput = z.infer<typeof albumSchema>;

export const galleryImageUploadSchema = z.object({
  albumId: z.string().uuid(),
  images: z
    .array(
      z.object({
        storagePath: z.string().min(1),
        url: z.string().url(),
        altText: z.string().min(1).max(200),
        caption: z.string().max(300).optional().or(z.literal("")),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
      })
    )
    .min(1, "Select at least one image to upload")
    .max(50, "Upload at most 50 images at a time"),
});

export type GalleryImageUploadInput = z.infer<typeof galleryImageUploadSchema>;

export const imageEditSchema = z.object({
  imageId: z.string().uuid(),
  caption: z.string().max(300).optional().or(z.literal("")),
  altText: z.string().min(1, "Alt text is required for accessibility").max(200),
});

export type ImageEditInput = z.infer<typeof imageEditSchema>;

export const gallerySearchSchema = z.object({
  q: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
});

export type GallerySearchInput = z.infer<typeof gallerySearchSchema>;
