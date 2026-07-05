"use server";

import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";
import { ADMIN_ROLES } from "@/lib/constants";
import type { ActionResult } from "@/types";

export async function submitContactAction(input: ContactInput): Promise<ActionResult<undefined>> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit({
    key: `contact:${ip}`,
    limit: 5,
    windowSeconds: 3600,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      error: "You've sent a few messages already — please wait a bit before sending another.",
    };
  }

  const { name, email, phone, subject, message } = parsed.data;

  try {
    const contact = await prisma.contact.create({
      data: { name, email, phone: phone || null, subject, message },
    });

    // Notify every staff member so a new inquiry surfaces in their admin
    // dashboard activity feed immediately.
    const staff = await prisma.user.findMany({
      where: { role: { in: ADMIN_ROLES }, isActive: true },
      select: { id: true },
    });

    if (staff.length > 0) {
      await prisma.notification.createMany({
        data: staff.map((member) => ({
          userId: member.id,
          type: NotificationType.CONTACT_SUBMISSION,
          title: "New Contact Message",
          message: `${name} sent a message: "${subject}"`,
          link: `/admin/contact`,
        })),
      });
    }

    return {
      success: true,
      data: undefined,
      message: "Message sent. We'll get back to you within 1-2 business days.",
    };
  } catch (error) {
    console.error("Contact form submission failed:", error);
    return { success: false, error: "Something went wrong. Please try again shortly." };
  }
}
