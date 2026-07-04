import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { requireManagementAccess } from "@/lib/auth";
import { getAllCategories } from "@/lib/data/blog";
import { CategoryManager } from "@/components/admin/blog/category-manager";

export const metadata: Metadata = { title: "Manage Categories", robots: { index: false, follow: false } };

export default async function CategoriesPage() {
  await requireManagementAccess();
  const categories = await getAllCategories();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/admin/blog" className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-nomad-red/10">
          <Tag className="h-5 w-5 text-nomad-red" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-nomad-white">Blog Categories</h1>
          <p className="text-sm text-nomad-ash">Organize ride stories into categories.</p>
        </div>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
