import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { BlogWithRelations } from "@/types";

interface BlogCardProps {
  blog: BlogWithRelations;
  priority?: boolean;
}

export function BlogCard({ blog, priority = false }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-nomad-steel bg-nomad-charcoal transition-colors hover:border-nomad-ash"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-nomad-steel">
        <Image
          src={blog.coverImageUrl}
          alt={blog.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {blog.category && (
          <Badge className="absolute left-3 top-3">{blog.category.name}</Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-nomad-white transition-colors group-hover:text-nomad-gold">
          {blog.title}
        </h3>
        <p className="line-clamp-2 text-sm text-nomad-ash">{blog.excerpt}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs text-nomad-ash">
          {blog.publishedAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(blog.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {blog.readingTimeMin} min read
          </span>
          {blog.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {blog.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
