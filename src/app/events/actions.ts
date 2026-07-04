"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { registrationSchema, type RegistrationInput } from "@/lib/validations/registration";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";
import { sendRegistrationConfirmationEmail } from "@/lib/email";
import { ADMIN_ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import type { ActionResult } from "@/types";

export async function submitRegistrationAction(
  input: RegistrationInput
): Promise<ActionResult<{ status: "CONFIRMED" | "WAITLISTED" }>> {
  const parsed = registrationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit({ key: `registration:${ip}`, limit: 5, windowSeconds: 3600 });
  if (!rateLimit.success) {
    return { success: false, error: "Too many registration attempts. Please try again later." };
  }

  const data = parsed.data;

  try {
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return { success: false, error: "This ride could not be found." };
    }
    if (!event.registrationOpen || event.status === "CANCELLED") {
      return { success: false, error: "Registration for this ride is closed." };
    }

    const seatsRemaining = Math.max(0, event.maxSeats - event._count.registrations);
    const status = seatsRemaining > 0 ? "CONFIRMED" : "WAITLISTED";

    // Prevent the same email from double-registering for the same ride.
    const existing = await prisma.registration.findFirst({
      where: { eventId: data.eventId, email: data.email },
    });
    if (existing) {
      return { success: false, error: "This email is already registered for this ride." };
    }

    const currentUser = await getCurrentUser();

    const registration = await prisma.registration.create({
      data: {
        eventId: data.eventId,
        userId: currentUser?.id ?? null,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        age: data.age,
        bloodGroup: data.bloodGroup,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        motorcycleBrand: data.motorcycleBrand,
        motorcycleModel: data.motorcycleModel,
        registrationNumber: data.registrationNumber,
        ridingExperience: data.ridingExperience,
        hasHelmet: data.hasHelmet,
        hasJacket: data.hasJacket,
        hasGloves: data.hasGloves,
        hasBoots: data.hasBoots,
        hasKneeGuards: data.hasKneeGuards,
        allergies: data.allergies || null,
        medicalConditions: data.medicalConditions || null,
        agreedToRideResponsibly: data.agreedToRideResponsibly,
        status,
      },
    });

    const emailSent = await sendRegistrationConfirmationEmail(registration, event);
    if (emailSent) {
      await prisma.registration.update({
        where: { id: registration.id },
        data: { confirmationEmailSentAt: new Date() },
      });
    }

    const staff = await prisma.user.findMany({
      where: { role: { in: ADMIN_ROLES }, isActive: true },
      select: { id: true },
    });
    if (staff.length > 0) {
      await prisma.notification.createMany({
        data: staff.map((member) => ({
          userId: member.id,
          type: NotificationType.NEW_REGISTRATION,
          title: "New Ride Registration",
          message: `${data.fullName} registered for "${event.title}" (${status === "WAITLISTED" ? "waitlisted" : "confirmed"}).`,
          link: `/admin/events/${event.id}`,
        })),
      });
    }

    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/admin/events");

    return { success: true, data: { status } };
  } catch (error) {
    console.error("submitRegistrationAction failed:", error);
    return { success: false, error: "Something went wrong submitting your registration. Please try again." };
  }
}
