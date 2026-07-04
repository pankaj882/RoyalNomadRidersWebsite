import { Skeleton } from "@/components/ui/skeleton";

interface SectionSkeletonProps {
  /** Height class for the skeleton block, tuned per-section to reduce layout shift. */
  heightClassName?: string;
}

export function SectionSkeleton({ heightClassName = "h-96" }: SectionSkeletonProps) {
  return (
    <div className="container py-20">
      <Skeleton className="mb-4 h-4 w-32" />
      <Skeleton className="mb-10 h-10 w-72" />
      <Skeleton className={`w-full ${heightClassName}`} />
    </div>
  );
}
