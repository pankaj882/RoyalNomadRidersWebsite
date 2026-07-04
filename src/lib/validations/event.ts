import { z } from "zod";

export const eventSchema = z
  .object({
    title: z.string().min(4, "Title must be at least 4 characters").max(150),
    description: z.string().min(10, "Description must be at least 10 characters").max(3000),
    coverImageUrl: z.string().url("Upload a cover image before saving"),
    destination: z.string().min(2, "Destination is required").max(150),
    meetingPoint: z.string().min(2, "Meeting point is required").max(200),
    startDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), { message: "Enter a valid start date" }),
    endDate: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || !Number.isNaN(Date.parse(val)), { message: "Enter a valid end date" }),
    meetingTime: z.string().min(1, "Meeting time is required").max(20),
    difficulty: z.enum(["EASY", "MODERATE", "CHALLENGING", "EXTREME"]),
    distanceKm: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .refine((val) => Number.isFinite(val) && val > 0, { message: "Distance must be a positive number" }),
    rideCaptainName: z.string().min(2, "Ride captain name is required").max(100),
    rideCaptainPhone: z.string().max(20).optional().or(z.literal("")),
    maxSeats: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .refine((val) => Number.isInteger(val) && val > 0, { message: "Max seats must be a positive whole number" }),
    registrationOpen: z.boolean().default(true),
  })
  .refine((data) => !data.endDate || new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type EventInput = z.infer<typeof eventSchema>;
