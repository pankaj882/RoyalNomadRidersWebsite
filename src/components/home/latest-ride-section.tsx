import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Gauge, MapPin, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { EmptyState } from "@/components/shared/empty-state";
import { getLatestRide } from "@/lib/data/home";
import { formatDate, formatDistance } from "@/lib/utils";

export async function LatestRideSection() {
  const ride = await getLatestRide();

  return (
    <section className="bg-nomad-black py-20 sm:py-28">
      <div className="container">
        <SectionHeading eyebrow="Fresh Off The Road" title="Latest Ride Story" className="mb-12" />

        {!ride ? (
          <EmptyState
            icon={Bike}
            title="No Ride Stories Yet"
            description="The first ride report from the club will appear here as soon as it's published."
          />
        ) : (
          <AnimatedContainer>
            <Link
              href={`/blog/${ride.slug}`}
              className="group grid grid-cols-1 overflow-hidden rounded-xl border border-nomad-steel bg-nomad-charcoal lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                <Image
                  src={ride.coverImageUrl}
                  alt={ride.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
                {ride.category && (
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-nomad-gold">
                    {ride.category.name}
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold leading-tight text-nomad-white transition-colors group-hover:text-nomad-gold sm:text-3xl">
                  {ride.title}
                </h3>
                <p className="line-clamp-3 text-sm text-nomad-ash sm:text-base">{ride.excerpt}</p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-nomad-ash">
                  {ride.publishedAt && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatDate(ride.publishedAt)}
                    </span>
                  )}
                  {ride.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {ride.location}
                    </span>
                  )}
                  {!!ride.distanceKm && (
                    <span className="flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5" /> {formatDistance(ride.distanceKm)}
                    </span>
                  )}
                </div>

                <Button asChild variant="outline" className="mt-2 w-fit">
                  <span>
                    Read Full Story <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </div>
            </Link>
          </AnimatedContainer>
        )}
      </div>
    </section>
  );
}
