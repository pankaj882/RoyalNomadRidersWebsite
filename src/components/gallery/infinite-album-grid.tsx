"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { AlbumCard } from "@/components/gallery/album-card";
import { AnimatedContainer } from "@/components/shared/animated-container";
import type { AlbumWithPreview, PaginationMeta } from "@/types";

interface InfiniteAlbumGridProps {
  initialItems: AlbumWithPreview[];
  initialMeta: PaginationMeta;
  /** Current search/filter query string (without a leading `?`), so subsequent page fetches match the active filters. */
  queryString: string;
}

/**
 * Fulfills the spec's "infinite scrolling for gallery" performance
 * requirement. The first page is rendered server-side (in `/gallery/page.tsx`)
 * for SEO and a working no-JS experience; this component takes over from
 * page 2 onward, fetching from `/api/gallery/albums` as the sentinel div
 * enters the viewport.
 */
export function InfiniteAlbumGrid({ initialItems, initialMeta, queryString }: InfiniteAlbumGridProps) {
  const [items, setItems] = useState(initialItems);
  const [meta, setMeta] = useState(initialMeta);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset local state whenever the filters change (new queryString means
  // the parent Server Component re-rendered with a fresh first page).
  useEffect(() => {
    setItems(initialItems);
    setMeta(initialMeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const loadNextPage = useCallback(async () => {
    if (isLoading || meta.page >= meta.totalPages) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams(queryString);
      params.set("page", String(meta.page + 1));
      const response = await fetch(`/api/gallery/albums?${params.toString()}`);
      const data = await response.json();

      setItems((prev) => [...prev, ...data.items]);
      setMeta(data.meta);
    } catch {
      // Silently stop — the visitor can still browse what's already loaded.
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, meta, queryString]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage]);

  const hasMore = meta.page < meta.totalPages;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((album, index) => (
          <AnimatedContainer key={album.id} delay={(index % 4) * 0.06}>
            <AlbumCard album={album} priority={index < 4} />
          </AnimatedContainer>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {isLoading && (
            <span className="flex items-center gap-2 text-sm text-nomad-ash">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more albums...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
