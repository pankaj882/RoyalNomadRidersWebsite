import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

/**
 * Builds a consistent Next.js `Metadata` object for a page, including
 * canonical URL, Open Graph, and Twitter Card tags. Every route that needs
 * custom SEO should call this from its `generateMetadata` export rather
 * than hand-rolling metadata objects, so the site keeps a single consistent
 * SEO contract.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  image = siteConfig.ogImage,
  noIndex = false,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: BuildMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;
  const fullTitle = path === "/" ? title : `${title} | ${siteConfig.name}`;
  const imageUrl = image.startsWith("http") ? image : `${siteConfig.url}${image}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      locale: "en_IN",
      type,
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

/** Organization JSON-LD, injected once in the root layout. */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    foundingDate: String(siteConfig.founded),
    sameAs: [
      siteConfig.links.instagram,
      siteConfig.links.facebook,
      siteConfig.links.youtube,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      contactType: "customer service",
    },
  };
}

/** Website + SearchAction JSON-LD (enables Google sitelinks search box). */
export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList JSON-LD for any page with a defined breadcrumb trail. */
export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

interface BlogPostingJsonLdInput {
  title: string;
  description: string;
  slug: string;
  coverImageUrl: string;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
}

/** BlogPosting JSON-LD for individual blog post pages. */
export function buildBlogPostingJsonLd(post: BlogPostingJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.coverImageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

interface EventJsonLdInput {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  meetingPoint: string;
  destination: string;
  coverImageUrl: string;
  slug: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
}

/** Event JSON-LD for event detail pages — powers Google's event rich results. */
export function buildEventJsonLd(event: EventJsonLdInput) {
  const statusMap: Record<EventJsonLdInput["status"], string> = {
    UPCOMING: "https://schema.org/EventScheduled",
    ONGOING: "https://schema.org/EventScheduled",
    COMPLETED: "https://schema.org/EventScheduled",
    CANCELLED: "https://schema.org/EventCancelled",
  };

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    ...(event.endDate && { endDate: event.endDate }),
    eventStatus: statusMap[event.status],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.meetingPoint,
      address: event.destination,
    },
    image: [event.coverImageUrl],
    organizer: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    url: `${siteConfig.url}/events/${event.slug}`,
  };
}

interface ImageGalleryJsonLdInput {
  name: string;
  description: string;
  slug: string;
  images: { url: string; caption?: string | null }[];
}

/** ImageGallery JSON-LD for gallery album detail pages. */
export function buildImageGalleryJsonLd(input: ImageGalleryJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: input.name,
    description: input.description,
    url: `${siteConfig.url}/gallery/${input.slug}`,
    image: input.images.map((image) => ({
      "@type": "ImageObject",
      contentUrl: image.url,
      ...(image.caption && { caption: image.caption }),
    })),
  };
}

/** Renders a JSON-LD `<script>` payload. Use inside a Server Component. */
export function jsonLdScriptProps(data: Record<string, unknown>) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
