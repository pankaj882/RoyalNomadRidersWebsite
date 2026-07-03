import { Role } from "@prisma/client";
import { clientEnv } from "@/lib/env";

export const siteConfig = {
  name: clientEnv.NEXT_PUBLIC_SITE_NAME,
  shortName: "RNRC",
  url: clientEnv.NEXT_PUBLIC_SITE_URL,
  description:
    "Royal Nomad Riders Club is an adventure motorcycle riding community for long-distance touring, off-roading, and mountain expeditions across India.",
  tagline: "Ride Far. Ride Free.",
  ogImage: "/og/default-og.jpg",
  links: {
    instagram: "https://instagram.com/royalnomadriders",
    facebook: "https://facebook.com/royalnomadriders",
    whatsapp: "https://wa.me/910000000000",
    youtube: "https://youtube.com/@royalnomadriders",
  },
  contact: {
    email: "contact@royalnomadriders.com",
    phone: "+91 00000 00000",
  },
  founded: 2018,
} as const;

export const mainNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNavLinks = {
  club: [
    { label: "About Us", href: "/about" },
    { label: "Safety Guidelines", href: "/about#safety" },
    { label: "Core Members", href: "/about#members" },
    { label: "Timeline", href: "/about#timeline" },
  ],
  explore: [
    { label: "Photo Gallery", href: "/gallery" },
    { label: "Ride Stories", href: "/blog" },
    { label: "Upcoming Events", href: "/events" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
} as const;

/** Human-readable labels for the Role enum, used across admin UI. */
export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  BLOG_AUTHOR: "Blog Author",
  MEMBER: "Member",
};

/** Roles permitted to access /admin at all. */
export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "BLOG_AUTHOR"];

/** Roles permitted to manage users, events, and gallery (full admin power). */
export const MANAGEMENT_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

/** Only the Super Admin can manage user roles. */
export const SUPER_ADMIN_ROLES: Role[] = ["SUPER_ADMIN"];

export const DIFFICULTY_LABELS = {
  EASY: "Easy",
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
  EXTREME: "Extreme",
} as const;

export const RIDING_EXPERIENCE_LABELS = {
  BEGINNER: "Beginner (0-1 years)",
  INTERMEDIATE: "Intermediate (1-3 years)",
  ADVANCED: "Advanced (3-7 years)",
  PROFESSIONAL: "Professional (7+ years)",
} as const;

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
