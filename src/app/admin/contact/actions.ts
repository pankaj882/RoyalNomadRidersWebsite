"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ContactStatus } from "@prisma/client";
import { requireManagementAccess } from "@/lib/auth";
import type { ActionResult } from "@/types";

const VALID_STATUSES = Object.values(ContactStatus);

export async function updateContactStatusAction(
  contactId: string,
  status: string
): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  if (!VALID_STATUSES.includes(status as ContactStatus)) {
    return { success: false, error: "Invalid status." };
  }

  try {
    await prisma.contact.update({ where: { id: contactId }, data: { status: status as ContactStatus } });
    revalidatePath("/admin/contact");
    return { success: true, data: undefined, message: "Status updated." };
  } catch (error) {
    console.error("updateContactStatusAction failed:", error);
    return { success: false, error: "Something went wrong." };
  }
}
