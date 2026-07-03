import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[92vh] flex-col justify-center gap-6 px-4">
      <div className="container flex flex-col gap-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-16 w-full max-w-2xl" />
        <Skeleton className="h-16 w-full max-w-xl" />
        <Skeleton className="h-6 w-full max-w-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-44" />
          <Skeleton className="h-12 w-44" />
        </div>
      </div>
    </div>
  );
}
