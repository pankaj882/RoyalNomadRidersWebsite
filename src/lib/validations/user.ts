import { z } from "zod";

export const founderDisplaySchema = z.object({
  isFounder: z.boolean(),
  founderTitle: z.string().max(80).optional().or(z.literal("")),
  displayOrder: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val >= 0, { message: "Display order must be a non-negative whole number" }),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(300, "Bio must be under 300 characters").optional().or(z.literal("")),
  instagramHandle: z
    .string()
    .max(40)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val.replace(/^@/, "").trim() : val)),
});

export type FounderDisplayInput = z.infer<typeof founderDisplaySchema>;
