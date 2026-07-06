import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { BlogCard } from "@/components/shared/blog-card";
import { BlogFilters } from "./blog-filters";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Pagination } from "@/components/shared/pagination";
import { getPublishedBlogs, getAllCategories } from "@/lib/data/blog";
import { buildMetadata, buildBreadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: "Ride Stories & Blog",
  description: `Ride reports, trip logs, and gear reviews from ${siteConfig.name} members.`,
  path: "/blog",
});

interface BlogPageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1;

  const [{ items: blogs, meta }, categories] = await Promise.all([
    getPublishedBlogs({ q: params.q, category: params.category, page }),
    getAllCategories(),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);

  function buildHref(targetPage: number): string {
    const p = new URLSearchParams();
    if (params.q) p.set("q", params.q);
    if (params.category) p.set("category", params.category);
    if (targetPage > 1) p.set("page", String(targetPage));
    const qs = p.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />

      <section className="border-b border-nomad-steel bg-nomad-charcoal py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            as="h1"
            eyebrow="From The Road"
            title="Ride Stories"
            description="Trip reports, gear reviews, and lessons learned — written by the riders who lived them."
          />
        </div>
      </section>

      <section className="bg-nomad-black py-12 sm:py-16">
        <div className="container flex flex-col gap-10">
          <BlogFilters categories={categories} />

          {blogs.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={params.q || params.category ? "No Posts Match Your Search" : "No Stories Published Yet"}
              description={
                params.q || params.category
                  ? "Try a different search term or clear your filters."
                  : "Ride reports from the club will appear here once they're published."
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog, index) => (
                  <AnimatedContainer key={blog.id} delay={(index % 3) * 0.08}>
                    <BlogCard blog={blog} priority={index < 3} />
                  </AnimatedContainer>
                ))}
              </div>
              <Pagination meta={meta} buildHref={buildHref} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
