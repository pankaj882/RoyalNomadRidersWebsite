import { z } from "zod";

export const blogSchema = z.object({
  title: z
    .string()
    .min(4, "Title must be at least 4 characters")
    .max(150, "Title must be under 150 characters"),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(300, "Excerpt must be under 300 characters"),
  content: z
    .string()
    .min(1, "Write something before saving")
    .refine((html) => html.replace(/<[^>]*>/g, "").trim().length >= 40, {
      message: "Post content must be at least 40 characters of actual text",
    }),
  coverImageUrl: z.string().url("Upload a cover image before saving"),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  rideDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), { message: "Enter a valid date" }),
  location: z.string().max(120).optional().or(z.literal("")),
  motorcycle: z.string().max(120).optional().or(z.literal("")),
  distanceKm: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val === "" || val === undefined ? undefined : Number(val)))
    .refine((val) => val === undefined || (Number.isFinite(val) && val >= 0), {
      message: "Distance must be a positive number",
    }),
  metaTitle: z.string().max(70).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
});

export type BlogInput = z.infer<typeof blogSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name must be under 60 characters"),
  description: z.string().max(300).optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const commentSchema = z.object({
  blogId: z.string().uuid(),
  content: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(2000, "Comment must be under 2000 characters"),
  parentId: z.string().uuid().optional(),
});

export type CommentInput = z.infer<typeof commentSchema>;
