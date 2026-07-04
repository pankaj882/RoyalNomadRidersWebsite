"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManagementAccess } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import type { ActionResult } from "@/types";

async function generateUniqueEventSlug(title: string, excludeEventId?: string): Promise<string> {
  const base = slugify(title) || "ride";
  let candidate = base;
  let suffix = 1;

  while (suffix < 500) {
    const existing = await prisma.event.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeEventId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now()}`;
}

export async function createEventAction(input: EventInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requireManagementAccess();
  const parsed = eventSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const slug = await generateUniqueEventSlug(data.title);

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        destination: data.destination,
        meetingPoint: data.meetingPoint,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        meetingTime: data.meetingTime,
        difficulty: data.difficulty,
        distanceKm: data.distanceKm,
        rideCaptainName: data.rideCaptainName,
        rideCaptainPhone: data.rideCaptainPhone || null,
        maxSeats: data.maxSeats,
        registrationOpen: data.registrationOpen,
        createdById: user.id,
        status: "UPCOMING",
      },
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");

    return { success: true, data: { id: event.id, slug: event.slug }, message: "Event created." };
  } catch (error) {
    console.error("createEventAction failed:", error);
    return { success: false, error: "Something went wrong creating the event." };
  }
}

export async function updateEventAction(
  eventId: string,
  input: EventInput
): Promise<ActionResult<{ slug: string }>> {
  await requireManagementAccess();
  const parsed = eventSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        // Slug is NOT regenerated on edit — same rationale as Album/Blog slugs.
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        destination: data.destination,
        meetingPoint: data.meetingPoint,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        meetingTime: data.meetingTime,
        difficulty: data.difficulty,
        distanceKm: data.distanceKm,
        rideCaptainName: data.rideCaptainName,
        rideCaptainPhone: data.rideCaptainPhone || null,
        maxSeats: data.maxSeats,
        registrationOpen: data.registrationOpen,
      },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);

    return { success: true, data: { slug: event.slug }, message: "Event updated." };
  } catch (error) {
    console.error("updateEventAction failed:", error);
    return { success: false, error: "Something went wrong updating the event." };
  }
}

export async function toggleRegistrationOpenAction(
  eventId: string,
  registrationOpen: boolean
): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  try {
    const event = await prisma.event.update({ where: { id: eventId }, data: { registrationOpen } });

    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/admin/events");

    return {
      success: true,
      data: undefined,
      message: registrationOpen ? "Registration reopened." : "Registration closed.",
    };
  } catch (error) {
    console.error("toggleRegistrationOpenAction failed:", error);
    return { success: false, error: "Something went wrong." };
  }
}

export async function cancelEventAction(eventId: string): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status: "CANCELLED", registrationOpen: false },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/admin/events");

    return { success: true, data: undefined, message: "Event cancelled." };
  } catch (error) {
    console.error("cancelEventAction failed:", error);
    return { success: false, error: "Something went wrong." };
  }
}

export async function deleteEventAction(eventId: string): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  try {
    // Registrations cascade automatically (onDelete: Cascade in schema).
    await prisma.event.delete({ where: { id: eventId } });

    revalidatePath("/events");
    revalidatePath("/admin/events");

    return { success: true, data: undefined, message: "Event and its registrations were deleted." };
  } catch (error) {
    console.error("deleteEventAction failed:", error);
    return { success: false, error: "Something went wrong deleting the event." };
  }
}
