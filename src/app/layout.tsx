import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { siteConfig } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { buildMetadata, buildOrganizationJsonLd, buildWebsiteJsonLd, jsonLdScriptProps } from "@/lib/seo";
import "./globals.css";

const supabaseStorageOrigin = new URL(clientEnv.NEXT_PUBLIC_SUPABASE_URL).origin;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    path: "/",
  }),
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [
    "adventure motorcycle riding club",
    "Royal Enfield riding club India",
    "motorcycle touring community",
    "off-road riding club",
    "Ladakh motorcycle ride",
    "long distance motorcycle touring India",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to the origins hero/cover images are served from —
            shaves the DNS+TLS handshake off the critical path for LCP. */}
        <link rel="preconnect" href={supabaseStorageOrigin} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={supabaseStorageOrigin} />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script {...jsonLdScriptProps(buildOrganizationJsonLd())} />
        <script {...jsonLdScriptProps(buildWebsiteJsonLd())} />
      </head>
      <body className="min-h-screen bg-nomad-black font-sans">
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-nomad-gold focus:px-4 focus:py-2 focus:text-nomad-black"
          >
            Skip to main content
          </a>
          <SiteChrome>{children}</SiteChrome>
          <Toaster />
          {clientEnv.NEXT_PUBLIC_VERCEL_ANALYTICS !== "false" && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
