import type { Metadata } from "next";
import { Images } from "lucide-react";
import { InfiniteAlbumGrid } from "@/components/gallery/infinite-album-grid";
import { GalleryFilters } from "./gallery-filters";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { getAlbums, getAlbumLocations } from "@/lib/data/gallery";
import { buildMetadata, buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: "Photo Gallery",
  description: `Ride photos from ${siteConfig.name} — Ladakh, Goa, monsoon rides, camping trips, and off-road expeditions.`,
  path: "/gallery",
});

interface GalleryPageProps {
  searchParams: Promise<{ q?: string; location?: string }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const [{ items: albums, meta }, locations] = await Promise.all([
    getAlbums({ q: params.q, location: params.location }),
    getAlbumLocations(),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
  ]);

  const activeQuery = new URLSearchParams();
  if (params.q) activeQuery.set("q", params.q);
  if (params.location) activeQuery.set("location", params.location);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />

      <section className="border-b border-nomad-steel bg-nomad-charcoal py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            as="h1"
            eyebrow="Frame By Frame"
            title="Photo Gallery"
            description="Every mountain pass, monsoon run, and campsite sunset — captured by the riders who were there."
          />
        </div>
      </section>

      <section className="bg-nomad-black py-12 sm:py-16">
        <div className="container flex flex-col gap-10">
          <GalleryFilters locations={locations} />

          {albums.length === 0 ? (
            <EmptyState
              icon={Images}
              title={params.q || params.location ? "No Albums Match Your Search" : "Gallery Coming Soon"}
              description={
                params.q || params.location
                  ? "Try a different search term or clear your filters."
                  : "Ride albums from the club's trips will appear here once they're published."
              }
            />
          ) : (
            <InfiniteAlbumGrid
              key={activeQuery.toString()}
              initialItems={albums}
              initialMeta={meta}
              queryString={activeQuery.toString()}
            />
          )}
        </div>
      </section>
    </>
  );
}
