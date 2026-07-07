"use client";

import { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CommentForm } from "@/components/blog/comment-form";
import { useAuth } from "@/components/providers/auth-provider";
import { deleteCommentAction } from "@/app/blog/actions";
import { getInitials, formatDate } from "@/lib/utils";
import { ADMIN_ROLES } from "@/lib/constants";
import type { CommentWithAuthor } from "@/types";

interface CommentItemProps {
  comment: CommentWithAuthor;
  blogId: string;
  blogSlug: string;
  onChanged: () => void;
}

export function CommentItem({ comment, blogId, blogSlug, onChanged }: CommentItemProps) {
  const user = useAuth();
  const [isReplying, setIsReplying] = useState(false);

  const canDelete = (author: { id: string }) =>
    !!user && (user.id === author.id || ADMIN_ROLES.includes(user.role));

  async function handleDelete(commentId: string) {
    const result = await deleteCommentAction(commentId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Comment deleted.");
    onChanged();
  }

  return (
    <div className="flex flex-col gap-3">
      <CommentRow comment={comment} onDelete={canDelete(comment.author) ? () => handleDelete(comment.id) : undefined}>
        {!comment.parentId && (
          <button
            type="button"
            onClick={() => setIsReplying((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-nomad-ash hover:text-nomad-gold"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Reply
          </button>
        )}
      </CommentRow>

      {isReplying && (
        <div className="ml-12">
          <CommentForm
            blogId={blogId}
            blogSlug={blogSlug}
            parentId={comment.id}
            autoFocus
            onCancel={() => setIsReplying(false)}
            onPosted={() => {
              setIsReplying(false);
              onChanged();
            }}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="ml-12 flex flex-col gap-3 border-l border-nomad-steel pl-4">
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              onDelete={canDelete(reply.author) ? () => handleDelete(reply.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentRow({
  comment,
  onDelete,
  children,
}: {
  comment: { author: { name: string; avatarUrl: string | null }; content: string; createdAt: Date };
  onDelete?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        {comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />}
        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-nomad-white">{comment.author.name}</span>
          <span className="text-xs text-nomad-ash">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm text-nomad-fog">{comment.content}</p>
        <div className="mt-2 flex items-center gap-4">
          {children}
          {onDelete && (
            <ConfirmDialog
              trigger={
                <button className="flex items-center gap-1.5 text-xs text-nomad-ash hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              }
              title="Delete this comment?"
              description="This cannot be undone."
              confirmLabel="Delete"
              onConfirm={onDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
