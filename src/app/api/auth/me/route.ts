import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * Returns the current authenticated user (id, name, avatar, role) or `null`.
 * Called client-side by `AuthProvider` on mount and after auth state changes.
 *
 * Deliberately NOT called from the root layout's render path — doing so
 * would force `cookies()` access on every request and opt the entire app
 * out of static rendering / ISR. Keeping this behind a route handler lets
 * public marketing pages (home, about, contact, blog, gallery, events) stay
 * statically generated / ISR-cached, while the navbar's auth state hydrates
 * client-side a moment after first paint.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
