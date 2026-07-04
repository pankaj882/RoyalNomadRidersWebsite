import Image from "next/image";
import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { EmptyState } from "@/components/shared/empty-state";
import { getInstagramFeed } from "@/lib/instagram";
import { siteConfig } from "@/lib/constants";

export async function InstagramFeedSection() {
  const posts = await getInstagramFeed(8);

  return (
    <section className="bg-nomad-black py-20 sm:py-28">
      <div className="container">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <SectionHeading eyebrow="Follow The Ride" title="@royalnomadriders" align="center" />
          <a
            href={siteConfig.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-nomad-red hover:underline"
          >
            <Instagram className="h-4 w-4" />
            Follow on Instagram
          </a>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            icon={Instagram}
            title="Instagram Feed Not Connected"
            description="Connect an Instagram Business account and add INSTAGRAM_ACCESS_TOKEN to display the live feed here."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-md bg-nomad-steel"
              >
                <Image
                  src={post.mediaUrl}
                  alt={post.caption?.slice(0, 120) ?? "Royal Nomad Riders Club Instagram post"}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                  <Instagram className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
