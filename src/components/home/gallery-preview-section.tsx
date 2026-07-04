import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { EmptyState } from "@/components/shared/empty-state";
import { getGalleryPreview } from "@/lib/data/home";

export async function GalleryPreviewSection() {
  const images = await getGalleryPreview(8);

  return (
    <section className="bg-nomad-charcoal py-20 sm:py-28">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Frame By Frame" title="From The Gallery" />
          <Button asChild variant="ghost" className="w-fit">
            <Link href="/gallery">
              Browse Full Gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {images.length === 0 ? (
          <EmptyState
            icon={ImageOff}
            title="Gallery Coming Soon"
            description="Ride photos from Ladakh, Goa, monsoon rides, and weekend trails will land here."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <AnimatedContainer
                key={image.id}
                delay={index * 0.05}
                className={index === 0 ? "col-span-2 row-span-2" : ""}
              >
                <Link
                  href={`/gallery/${image.album.slug}`}
                  className="group relative block aspect-square w-full overflow-hidden rounded-md bg-nomad-steel"
                >
                  <Image
                    src={image.url}
                    alt={image.altText}
                    fill
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-medium text-white">{image.album.title}</span>
                  </div>
                </Link>
              </AnimatedContainer>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
