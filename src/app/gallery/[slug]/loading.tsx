import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="border-b border-nomad-steel bg-nomad-charcoal py-14 sm:py-20">
        <div className="container flex flex-col gap-4">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
      </div>
      <div className="container pb-16">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
