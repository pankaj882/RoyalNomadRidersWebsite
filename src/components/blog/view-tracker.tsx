"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ slug }: { slug: string }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    fetch(`/api/blog/${slug}/view`, { method: "POST" }).catch(() => {
      // Silently ignore — a missed view count increment isn't worth
      // surfacing to the reader.
    });
  }, [slug]);

  return null;
}
