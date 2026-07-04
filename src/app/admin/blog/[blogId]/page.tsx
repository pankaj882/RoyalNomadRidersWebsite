import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { BlogEditorForm } from "@/components/admin/blog/blog-editor-form";
import { requireAdminAccess } from "@/lib/auth";
import { getBlogForAdmin } from "@/lib/data/admin-blog";
import { getAllCategories } from "@/lib/data/blog";
import { MANAGEMENT_ROLES } from "@/lib/constants";

export const metadata: Metadata = { title: "Edit Post", robots: { index: false, follow: false } };

interface EditBlogPageProps {
  params: Promise<{ blogId: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const user = await requireAdminAccess();
  const { blogId } = await params;
  const [blog, categories] = await Promise.all([getBlogForAdmin(blogId), getAllCategories()]);

  if (!blog) {
    notFound();
  }

  const canEdit = MANAGEMENT_ROLES.includes(user.role) || blog.authorId === user.id;
  if (!canEdit) {
    redirect("/admin/blog?error=unauthorized");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Link href="/admin/blog" className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        {blog.status === "PUBLISHED" && (
          <Link
            href={`/blog/${blog.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-1.5 text-sm text-nomad-ash hover:text-nomad-white"
          >
            View Live <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">Edit Post</h1>
        <p className="mt-1 text-sm text-nomad-ash">{blog.title}</p>
      </div>

      <BlogEditorForm blog={blog} categories={categories} />
    </div>
  );
}
