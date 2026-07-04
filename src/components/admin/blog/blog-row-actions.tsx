"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Send, Undo2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { publishBlogAction, unpublishBlogAction, deleteBlogAction } from "@/app/admin/blog/actions";
import type { BlogStatus } from "@/types";

interface BlogRowActionsProps {
  blogId: string;
  slug: string;
  status: BlogStatus;
  canDelete: boolean;
}

export function BlogRowActions({ blogId, slug, status, canDelete }: BlogRowActionsProps) {
  const router = useRouter();

  async function handlePublish() {
    const result = await publishBlogAction(blogId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Post published.");
    router.refresh();
  }

  async function handleUnpublish() {
    const result = await unpublishBlogAction(blogId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Moved back to draft.");
    router.refresh();
  }

  async function handleDelete() {
    const result = await deleteBlogAction(blogId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Post deleted.");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      {status === "PUBLISHED" ? (
        <>
          <Button asChild size="sm" variant="ghost" aria-label="View live">
            <Link href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={handleUnpublish} aria-label="Unpublish">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <Button size="sm" variant="ghost" onClick={handlePublish} aria-label="Publish">
          <Send className="h-3.5 w-3.5" />
        </Button>
      )}
      {canDelete && (
        <ConfirmDialog
          trigger={
            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" aria-label="Delete post">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          }
          title="Delete this post?"
          description="This permanently deletes the post along with all its comments and likes. This cannot be undone."
          confirmLabel="Delete Post"
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
