"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn, formatNumber } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { toggleLikeAction } from "@/app/blog/actions";

interface LikeButtonProps {
  blogId: string;
  blogSlug: string;
  initialCount: number;
}

/**
 * `initialCount` comes from the ISR-cached page (Blog.likeCount is a
 * denormalized counter, fine to serve slightly stale). Whether THIS visitor
 * has already liked the post is per-user data and must NOT be baked into
 * the cached page — it's fetched client-side here, the same architectural
 * pattern used for auth state (see AuthProvider) and comments.
 */
export function LikeButton({ blogId, blogSlug, initialCount }: LikeButtonProps) {
  const user = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      setLiked(false);
      return;
    }

    let cancelled = false;
    fetch(`/api/blog/${blogSlug}/like-status`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLiked(!!data.liked);
      })
      .catch(() => {
        // Non-critical — worst case the button briefly shows "unliked".
      });

    return () => {
      cancelled = true;
    };
  }, [user, blogSlug]);

  function handleClick() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/blog/${blogSlug}`)}`);
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction(blogId, blogSlug);
      if (!result.success) {
        setLiked(liked);
        setCount((c) => c + (nextLiked ? -1 : 1));
        toast.error(result.error);
        return;
      }
      setLiked(result.data.liked);
      setCount(result.data.likeCount);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        liked
          ? "border-nomad-red bg-nomad-red/10 text-nomad-red"
          : "border-nomad-steel text-nomad-fog hover:border-nomad-red hover:text-nomad-red"
      )}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-nomad-red")} />
      {formatNumber(count)} {count === 1 ? "Like" : "Likes"}
    </button>
  );
}
