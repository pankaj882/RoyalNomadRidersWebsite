import type { Metadata } from "next";
import { FallbackImage } from "@/components/shared/fallback-image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Gauge, Bike } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BlogContent } from "@/components/blog/blog-content";
import { LikeButton } from "@/components/blog/like-button";
import { ShareButtons } from "@/components/blog/share-buttons";
import { ViewTracker } from "@/components/blog/view-tracker";
import { CommentSection } from "@/components/blog/comment-section";
import { RelatedPosts } from "@/components/blog/related-posts";
import { getBlogBySlug, getAllPublishedBlogSlugs, getRelatedBlogs } from "@/lib/data/blog";
import {
  buildMetadata,
  buildBreadcrumbJsonLd,
  buildBlogPostingJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";
import { formatDate, formatDistance, getInitials } from "@/lib/utils";
import { siteConfig } from "@/lib/constants";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 1800;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return buildMetadata({
      title: "Post Not Found",
      description: "This ride story doesn't exist or has been removed.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    path: `/blog/${blog.slug}`,
    image: blog.coverImageUrl,
    type: "article",
    publishedTime: blog.publishedAt?.toISOString(),
    modifiedTime: blog.updatedAt.toISOString(),
    authors: [blog.author.name],
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogs(blog.id, blog.categoryId, 3);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: blog.title, path: `/blog/${blog.slug}` },
  ]);

  const blogPostingJsonLd = buildBlogPostingJsonLd({
    title: blog.title,
    description: blog.excerpt,
    slug: blog.slug,
    coverImageUrl: blog.coverImageUrl,
    authorName: blog.author.name,
    publishedAt: (blog.publishedAt ?? blog.createdAt).toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  });

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <script {...jsonLdScriptProps(blogPostingJsonLd)} />
      <ViewTracker slug={blog.slug} />

      <article>
        <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-nomad-black">
          <FallbackImage
            src={blog.coverImageUrl}
            alt={blog.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nomad-black via-nomad-black/60 to-transparent" />

          <div className="container relative z-10 pb-12 pt-32">
            {blog.category && <Badge className="mb-4">{blog.category.name}</Badge>}
            <h1 className="max-w-3xl text-balance font-display text-3xl font-bold leading-tight text-nomad-white sm:text-5xl">
              {blog.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-nomad-fog">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  {blog.author.avatarUrl && <AvatarImage src={blog.author.avatarUrl} alt={blog.author.name} />}
                  <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{blog.author.name}</span>
              </div>
              {blog.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> {formatDate(blog.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {blog.readingTimeMin} min read
              </span>
            </div>
          </div>
        </section>

        <section className="bg-nomad-black py-12 sm:py-16">
          <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[1fr_260px]">
            <div className="flex flex-col gap-10">
              <BlogContent html={blog.content} />

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-nomad-steel pt-6">
                <LikeButton blogId={blog.id} blogSlug={blog.slug} initialCount={blog.likeCount} />
                <ShareButtons url={`${siteConfig.url}/blog/${blog.slug}`} title={blog.title} />
              </div>

              <CommentSection blogId={blog.id} blogSlug={blog.slug} />
            </div>

            <aside className="flex flex-col gap-4">
              <div className="rounded-lg border border-nomad-steel bg-nomad-charcoal p-5">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-nomad-ash">
                  Ride Details
                </h3>
                <dl className="flex flex-col gap-3 text-sm">
                  {blog.location && (
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-nomad-red" />
                      <dd className="text-nomad-fog">{blog.location}</dd>
                    </div>
                  )}
                  {blog.motorcycle && (
                    <div className="flex items-center gap-2.5">
                      <Bike className="h-4 w-4 shrink-0 text-nomad-red" />
                      <dd className="text-nomad-fog">{blog.motorcycle}</dd>
                    </div>
                  )}
                  {!!blog.distanceKm && (
                    <div className="flex items-center gap-2.5">
                      <Gauge className="h-4 w-4 shrink-0 text-nomad-red" />
                      <dd className="text-nomad-fog">{formatDistance(blog.distanceKm)}</dd>
                    </div>
                  )}
                  {blog.rideDate && (
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="h-4 w-4 shrink-0 text-nomad-red" />
                      <dd className="text-nomad-fog">{formatDate(blog.rideDate)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {blog.author.bio && (
                <div className="rounded-lg border border-nomad-steel bg-nomad-charcoal p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-nomad-ash">
                    About the Author
                  </h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {blog.author.avatarUrl && <AvatarImage src={blog.author.avatarUrl} alt={blog.author.name} />}
                      <AvatarFallback>{getInitials(blog.author.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-nomad-white">{blog.author.name}</span>
                  </div>
                  <p className="mt-3 text-sm text-nomad-ash">{blog.author.bio}</p>
                </div>
              )}
            </aside>
          </div>
        </section>
      </article>

      <RelatedPosts posts={relatedPosts} />
    </>
  );
}
