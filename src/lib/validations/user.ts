import { z } from "zod";

export const founderDisplaySchema = z.object({
  isFounder: z.boolean(),
  founderTitle: z.string().max(80).optional().or(z.literal("")),
  displayOrder: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val >= 0, { message: "Display order must be a non-negative whole number" }),
});

export type FounderDisplayInput = z.infer<typeof founderDisplaySchema>;
