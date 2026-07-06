import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="border-b border-nomad-steel bg-nomad-charcoal py-16 sm:py-20">
        <div className="container flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </div>
      <div className="container flex flex-col gap-8 pb-16">
        <Skeleton className="h-11 w-full max-w-xl" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
