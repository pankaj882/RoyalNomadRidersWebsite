import { SectionHeading } from "@/components/shared/section-heading";
import { BlogCard } from "@/components/shared/blog-card";
import type { BlogWithRelations } from "@/types";

interface RelatedPostsProps {
  posts: BlogWithRelations[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-nomad-steel bg-nomad-charcoal py-16 sm:py-20">
      <div className="container">
        <SectionHeading eyebrow="Keep Reading" title="More Ride Stories" className="mb-10" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} blog={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
