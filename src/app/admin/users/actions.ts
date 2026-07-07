"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/auth";
import { founderDisplaySchema, type FounderDisplayInput } from "@/lib/validations/user";
import type { ActionResult } from "@/types";

const VALID_ROLES = Object.values(Role);

export async function updateUserRoleAction(userId: string, role: string): Promise<ActionResult<undefined>> {
  const currentUser = await requireSuperAdmin();

  if (!VALID_ROLES.includes(role as Role)) {
    return { success: false, error: "Invalid role." };
  }

  if (userId === currentUser.id) {
    return { success: false, error: "You can't change your own role. Ask another Super Admin to do it." };
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { role: role as Role } });
    revalidatePath("/admin/users");
    return { success: true, data: undefined, message: "Role updated." };
  } catch (error) {
    console.error("updateUserRoleAction failed:", error);
    return { success: false, error: "Something went wrong updating the role." };
  }
}

export async function toggleUserActiveAction(userId: string, isActive: boolean): Promise<ActionResult<undefined>> {
  const currentUser = await requireSuperAdmin();

  if (userId === currentUser.id) {
    return { success: false, error: "You can't deactivate your own account." };
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { isActive } });
    revalidatePath("/admin/users");
    return {
      success: true,
      data: undefined,
      message: isActive ? "Account reactivated." : "Account deactivated.",
    };
  } catch (error) {
    console.error("toggleUserActiveAction failed:", error);
    return { success: false, error: "Something went wrong." };
  }
}

export async function updateFounderDisplayAction(
  userId: string,
  input: FounderDisplayInput
): Promise<ActionResult<undefined>> {
  await requireSuperAdmin();
  const parsed = founderDisplaySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isFounder: parsed.data.isFounder,
        founderTitle: parsed.data.founderTitle || null,
        displayOrder: parsed.data.displayOrder,
        avatarUrl: parsed.data.avatarUrl || null,
        bio: parsed.data.bio || null,
        instagramHandle: parsed.data.instagramHandle || null,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/about");

    return { success: true, data: undefined, message: "Profile updated." };
  } catch (error) {
    console.error("updateFounderDisplayAction failed:", error);
    return { success: false, error: "Something went wrong." };
  }
}
