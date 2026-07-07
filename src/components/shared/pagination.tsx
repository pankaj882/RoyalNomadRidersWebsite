import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types";

interface PaginationProps {
  meta: PaginationMeta;
  /** Builds the href for a given page number, preserving other query params. */
  buildHref: (page: number) => string;
}

export function Pagination({ meta, buildHref }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const { page, totalPages } = meta;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-4">
      <PageLink href={buildHref(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      {pages.map((p, index) => {
        const prev = pages[index - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && <span className="px-1 text-nomad-ash">&hellip;</span>}
            <PageLink href={buildHref(p)} isActive={p === page}>
              {p}
            </PageLink>
          </span>
        );
      })}

      <PageLink href={buildHref(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  isActive,
  disabled,
  children,
  ...rest
}: {
  href: string;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-md text-nomad-ash/40">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium text-nomad-fog transition-colors hover:bg-nomad-steel",
        isActive && "bg-nomad-gold text-nomad-black hover:bg-nomad-gold"
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
