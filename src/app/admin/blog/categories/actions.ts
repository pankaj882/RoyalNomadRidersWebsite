"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireManagementAccess } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { categorySchema, type CategoryInput } from "@/lib/validations/blog";
import type { ActionResult } from "@/types";

async function generateUniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "category";
  let candidate = base;
  let suffix = 1;

  while (suffix < 100) {
    const existing = await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now()}`;
}

export async function createCategoryAction(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  await requireManagementAccess();
  const parsed = categorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const slug = await generateUniqueCategorySlug(parsed.data.name);

  try {
    const category = await prisma.category.create({
      data: { name: parsed.data.name, slug, description: parsed.data.description || null },
    });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");

    return { success: true, data: { id: category.id }, message: "Category created." };
  } catch (error) {
    console.error("createCategoryAction failed:", error);
    return { success: false, error: "Something went wrong creating the category." };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  input: CategoryInput
): Promise<ActionResult<undefined>> {
  await requireManagementAccess();
  const parsed = categorySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { name: parsed.data.name, description: parsed.data.description || null },
    });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");

    return { success: true, data: undefined, message: "Category updated." };
  } catch (error) {
    console.error("updateCategoryAction failed:", error);
    return { success: false, error: "Something went wrong updating the category." };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult<undefined>> {
  await requireManagementAccess();

  try {
    // Blog.category uses onDelete: SetNull, so existing posts simply become
    // uncategorized rather than blocking deletion or cascading.
    await prisma.category.delete({ where: { id: categoryId } });

    revalidatePath("/admin/blog/categories");
    revalidatePath("/blog");

    return { success: true, data: undefined, message: "Category deleted." };
  } catch (error) {
    console.error("deleteCategoryAction failed:", error);
    return { success: false, error: "Something went wrong deleting the category." };
  }
}
