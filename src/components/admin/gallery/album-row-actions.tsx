"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, StarOff, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toggleAlbumFeaturedAction, deleteAlbumAction } from "@/app/admin/gallery/actions";

interface AlbumRowActionsProps {
  albumId: string;
  isFeatured: boolean;
}

export function AlbumRowActions({ albumId, isFeatured }: AlbumRowActionsProps) {
  const router = useRouter();

  async function handleToggleFeatured() {
    const result = await toggleAlbumFeaturedAction(albumId, !isFeatured);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isFeatured ? "Removed from featured." : "Marked as featured.");
    router.refresh();
  }

  async function handleDelete() {
    const result = await deleteAlbumAction(albumId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Album deleted.");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/gallery/${albumId}`}>
          <Settings className="h-3.5 w-3.5" />
          Manage
        </Link>
      </Button>
      <Button size="sm" variant="ghost" onClick={handleToggleFeatured} aria-label="Toggle featured">
        {isFeatured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
      </Button>
      <ConfirmDialog
        trigger={
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" aria-label="Delete album">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
        title="Delete this album?"
        description="This permanently deletes the album and every photo inside it, including the files in storage. This cannot be undone."
        confirmLabel="Delete Album"
        onConfirm={handleDelete}
      />
    </div>
  );
}
