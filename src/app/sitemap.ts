import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/constants";

/**
 * Static routes plus every published Album and Blog slug. Event slugs are
 * appended here the same way once Events have public detail pages (Phase 5)
 * — the shape of this function does not change, only the arrays being
 * concatenated.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.9, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" },
    { path: "/events", priority: 0.9, changeFrequency: "daily" },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  ];

  const [albums, blogs] = await Promise.all([
    prisma.album.findMany({ select: { slug: true, updatedAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.blog.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const albumEntries: MetadataRoute.Sitemap = albums.map((album) => ({
    url: `${siteConfig.url}/gallery/${album.slug}`,
    lastModified: album.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${siteConfig.url}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticEntries, ...albumEntries, ...blogEntries];
}
