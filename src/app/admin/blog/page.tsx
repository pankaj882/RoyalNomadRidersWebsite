import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireAdminAccess } from "@/lib/auth";
import { getBlogsForAdmin } from "@/lib/data/admin-blog";
import { MANAGEMENT_ROLES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { BlogRowActions } from "@/components/admin/blog/blog-row-actions";

export const metadata: Metadata = { title: "Manage Blog", robots: { index: false, follow: false } };

const statusVariant = {
  DRAFT: "secondary",
  PUBLISHED: "success",
  ARCHIVED: "outline",
} as const;

export default async function AdminBlogPage() {
  const user = await requireAdminAccess();
  const blogs = await getBlogsForAdmin(user.id, user.role);
  const canManageCategories = MANAGEMENT_ROLES.includes(user.role);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-nomad-white">Blog</h1>
          <p className="mt-1 text-sm text-nomad-ash">
            {MANAGEMENT_ROLES.includes(user.role) ? "All ride stories across the club." : "Your ride stories."}
          </p>
        </div>
        <div className="flex gap-2">
          {canManageCategories && (
            <Button asChild variant="outline">
              <Link href="/admin/blog/categories">
                <Tag className="h-4 w-4" />
                Categories
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus className="h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 px-6 py-16 text-center">
          <FileText className="h-8 w-8 text-nomad-gold" />
          <h3 className="font-display text-lg font-semibold text-nomad-white">No Posts Yet</h3>
          <p className="max-w-sm text-sm text-nomad-ash">Write your first ride story to get started.</p>
          <Button asChild className="mt-2">
            <Link href="/admin/blog/new">Write a Post</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-nomad-steel">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-nomad-charcoal text-xs uppercase tracking-wide text-nomad-ash">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Author</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nomad-steel bg-nomad-black">
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="max-w-xs px-4 py-3">
                    <Link href={`/admin/blog/${blog.id}`} className="font-medium text-nomad-white hover:text-nomad-gold">
                      {blog.title}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-nomad-ash sm:table-cell">{blog.author.name}</td>
                  <td className="hidden px-4 py-3 text-nomad-ash md:table-cell">
                    {blog.category?.name ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[blog.status]}>{blog.status}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-nomad-ash sm:table-cell">{formatDate(blog.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <BlogRowActions
                      blogId={blog.id}
                      slug={blog.slug}
                      status={blog.status}
                      canDelete={MANAGEMENT_ROLES.includes(user.role) || blog.authorId === user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
