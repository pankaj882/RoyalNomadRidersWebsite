"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/auth";
import type { ActionResult } from "@/types";

export async function markNotificationReadAction(notificationId: string): Promise<ActionResult<undefined>> {
  const user = await requireAdminAccess();

  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true },
    });
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("markNotificationReadAction failed:", error);
    return { success: false, error: "Something went wrong." };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult<undefined>> {
  const user = await requireAdminAccess();

  try {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("markAllNotificationsReadAction failed:", error);
    return { success: false, error: "Something went wrong." };
  }
}
