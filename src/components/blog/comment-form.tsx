"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";
import { createCommentAction } from "@/app/blog/actions";

interface CommentFormProps {
  blogId: string;
  blogSlug: string;
  parentId?: string;
  onPosted: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentForm({ blogId, blogSlug, parentId, onPosted, onCancel, autoFocus }: CommentFormProps) {
  const user = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-nomad-steel bg-nomad-charcoal p-4 text-sm text-nomad-ash">
        <span>Sign in to join the conversation.</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/login?next=${encodeURIComponent(`/blog/${blogSlug}`)}`)}
        >
          Sign In
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const result = await createCommentAction({ blogId, content, parentId });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setContent("");
    onPosted();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Share your thoughts on this ride..."}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        maxLength={2000}
      />
      <div className="flex items-center gap-2 self-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}
