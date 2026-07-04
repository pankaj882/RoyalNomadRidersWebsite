import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { EmptyState } from "@/components/shared/empty-state";
import { BlogCard } from "@/components/shared/blog-card";
import { getLatestRide, getRecentBlogs } from "@/lib/data/home";

export async function RecentBlogsSection() {
  const latestRide = await getLatestRide();
  const blogs = await getRecentBlogs(3, latestRide?.id);

  return (
    <section className="bg-nomad-black py-20 sm:py-28">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="From The Road" title="Recent Ride Stories" />
          <Button asChild variant="ghost" className="w-fit">
            <Link href="/blog">
              Read All Stories <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {blogs.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No Stories Published Yet"
            description="Ride reports, trip logs, and gear reviews from the club will show up here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <AnimatedContainer key={blog.id} delay={index * 0.1}>
                <BlogCard blog={blog} priority={index === 0} />
              </AnimatedContainer>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
