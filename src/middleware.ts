import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_PATH_PREFIX = "/admin";
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith(ADMIN_PATH_PREFIX);
  const isAuthRoute = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Unauthenticated users hitting /admin/** are bounced to /login, with the
  // originally requested path preserved so we can return them after sign-in.
  if (isAdminRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already-authenticated users don't need the login/register screens again.
  // Fine-grained role checks (e.g. Blog Author trying to open /admin/users)
  // happen server-side in each route via requireRole(), since role lookup
  // requires a Prisma query that we intentionally keep out of middleware
  // (middleware should stay fast and Edge-safe).
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (SEO files)
     * - public assets (images, fonts, textures)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)$).*)",
  ],
};
