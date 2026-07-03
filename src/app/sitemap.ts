import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

/**
 * Static route sitemap for Phase 1. Once Blog, Event, and Album records
 * exist (Phase 3+), this file is extended to also query Prisma and append
 * one <url> entry per published slug — the function signature and export
 * shape below do not change, only the array construction does.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.9, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" },
    { path: "/events", priority: 0.9, changeFrequency: "daily" },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
