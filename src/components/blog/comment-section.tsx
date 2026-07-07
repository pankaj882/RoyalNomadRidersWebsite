"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentForm } from "@/components/blog/comment-form";
import { CommentItem } from "@/components/blog/comment-item";
import type { CommentWithAuthor } from "@/types";

interface CommentSectionProps {
  blogId: string;
  blogSlug: string;
}

export function CommentSection({ blogId, blogSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithAuthor[] | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/blog/${blogSlug}/comments`, { cache: "no-store" });
      const data = await response.json();
      setComments(data.comments ?? []);
    } catch {
      setComments([]);
    }
  }, [blogSlug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const totalCount =
    comments?.reduce((sum, comment) => sum + 1 + comment.replies.length, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-nomad-white">
        <MessageSquare className="h-5 w-5 text-nomad-gold" />
        Comments {comments !== null && `(${totalCount})`}
      </h2>

      <CommentForm blogId={blogId} blogSlug={blogSlug} onPosted={loadComments} />

      {comments === null ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-nomad-ash">Be the first to comment on this ride.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              blogId={blogId}
              blogSlug={blogSlug}
              onChanged={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
