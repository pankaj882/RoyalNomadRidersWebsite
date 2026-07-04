import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogEditorForm } from "@/components/admin/blog/blog-editor-form";
import { requireAdminAccess } from "@/lib/auth";
import { getAllCategories } from "@/lib/data/blog";

export const metadata: Metadata = { title: "New Post", robots: { index: false, follow: false } };

export default async function NewBlogPage() {
  await requireAdminAccess();
  const categories = await getAllCategories();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/blog" className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white">
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">New Post</h1>
        <p className="mt-1 text-sm text-nomad-ash">Write a ride story. Save as draft or publish immediately.</p>
      </div>

      <BlogEditorForm categories={categories} />
    </div>
  );
}
