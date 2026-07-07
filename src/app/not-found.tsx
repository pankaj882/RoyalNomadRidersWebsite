import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-nomad-steel bg-nomad-charcoal">
        <Compass className="h-8 w-8 text-nomad-gold" aria-hidden="true" />
      </span>
      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">
          <span className="text-nomad-gold">404</span> — Off The Map
        </h1>
        <p className="mt-2 max-w-md text-sm text-nomad-ash">
          Looks like this trail doesn&apos;t exist. Let&apos;s get you back on route.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Back Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/events">See Upcoming Rides</Link>
        </Button>
      </div>
    </div>
  );
}
