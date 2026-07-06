"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Routes that render their own complete chrome (admin sidebar/header, or the
// centered auth card layout) and must NOT also get the public marketing
// Navbar + Footer wrapped around them from the root layout.
const NO_SITE_CHROME_PREFIXES = [
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

function shouldHideChrome(pathname: string): boolean {
  return NO_SITE_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * This is a client component (rather than deciding server-side in
 * `layout.tsx`) specifically so it can read the live pathname via
 * `usePathname()` without forcing the root layout itself to depend on
 * `headers()`/`cookies()` — which would opt every route in the app out of
 * static rendering (the same principle documented in the README's "Phase 2
 * Notes" for auth state). The trade-off is a client-side decision instead
 * of a server one; since this only toggles which layout chrome renders (not
 * page content), there's no meaningful hydration flash.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (shouldHideChrome(pathname)) {
    // Admin and auth routes provide their own <main> landmark (with its own
    // id="main-content" for the skip link) inside their own layout — an
    // extra <main> wrapper here would produce invalid nested landmarks.
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
