import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, CalendarDays, Images } from "lucide-react";
import { AlbumImageGrid } from "@/components/gallery/album-image-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { getAlbumBySlug, getAllAlbumSlugs } from "@/lib/data/gallery";
import { buildMetadata, buildBreadcrumbJsonLd, buildImageGalleryJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

// Prerenders every existing album at build time (SSG); new albums created
// later are served via on-demand ISR fallback and cached after first visit.
export async function generateStaticParams() {
  const slugs = await getAllAlbumSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) {
    return buildMetadata({
      title: "Album Not Found",
      description: "This gallery album doesn't exist or has been removed.",
      path: `/gallery/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: album.title,
    description:
      album.description ??
      `${album.images.length} photos from ${album.title}${album.location ? ` in ${album.location}` : ""}.`,
    path: `/gallery/${album.slug}`,
    image: album.coverImageUrl ?? album.images[0]?.url,
  });
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) {
    notFound();
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
    { name: album.title, path: `/gallery/${album.slug}` },
  ]);

  const imageGalleryJsonLd = buildImageGalleryJsonLd({
    name: album.title,
    description: album.description ?? album.title,
    slug: album.slug,
    images: album.images.map((image) => ({ url: image.url, caption: image.caption })),
  });

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <script {...jsonLdScriptProps(imageGalleryJsonLd)} />

      <section className="border-b border-nomad-steel bg-nomad-charcoal py-14 sm:py-20">
        <div className="container">
          <h1 className="font-display text-3xl font-bold text-nomad-white sm:text-5xl">
            {album.title}
          </h1>
          {album.description && (
            <p className="mt-3 max-w-2xl text-sm text-nomad-ash sm:text-base">{album.description}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-nomad-ash sm:text-sm">
            {album.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {album.location}
              </span>
            )}
            {album.rideDate && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {formatDate(album.rideDate)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Images className="h-4 w-4" /> {album.images.length} photo
              {album.images.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-nomad-black py-12 sm:py-16">
        <div className="container">
          {album.images.length === 0 ? (
            <EmptyState
              icon={Images}
              title="No Photos Yet"
              description="Photos for this album haven't been uploaded yet — check back soon."
            />
          ) : (
            <AlbumImageGrid images={album.images} />
          )}
        </div>
      </section>
    </>
  );
}
