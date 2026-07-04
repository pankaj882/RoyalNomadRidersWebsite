import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/constants";

const phonePattern = /^[0-9+\-\s()]{7,20}$/;

export const registrationSchema = z.object({
  eventId: z.string().uuid(),

  // Personal
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().regex(phonePattern, "Enter a valid phone number"),
  age: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val >= 16 && val <= 100, {
      message: "Age must be between 16 and 100",
    }),
  bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Select a blood group" }) }),
  emergencyContactName: z.string().min(2, "Emergency contact name is required").max(100),
  emergencyContactPhone: z.string().regex(phonePattern, "Enter a valid phone number"),

  // Motorcycle
  motorcycleBrand: z.string().min(2, "Motorcycle brand is required").max(60),
  motorcycleModel: z.string().min(1, "Motorcycle model is required").max(60),
  registrationNumber: z.string().min(4, "Registration number is required").max(20),
  ridingExperience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"], {
    errorMap: () => ({ message: "Select your riding experience" }),
  }),

  // Ride gear
  hasHelmet: z.boolean().default(false),
  hasJacket: z.boolean().default(false),
  hasGloves: z.boolean().default(false),
  hasBoots: z.boolean().default(false),
  hasKneeGuards: z.boolean().default(false),

  // Medical
  allergies: z.string().max(500).optional().or(z.literal("")),
  medicalConditions: z.string().max(500).optional().or(z.literal("")),

  agreedToRideResponsibly: z.literal(true, {
    errorMap: () => ({ message: "You must agree to ride responsibly to register" }),
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
