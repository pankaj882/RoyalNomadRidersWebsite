"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * A generic, always-available "back" affordance for the admin section.
 * Individual pages (e.g. "Back to Blog") also have their own specific
 * back-to-list links, but several admin pages didn't (Users, Messages,
 * and the top-level list pages themselves) — this fixes that gap
 * comprehensively in one place instead of patching each page individually.
 *
 * Uses browser history (`router.back()`) rather than a hardcoded href,
 * since "back" should mean "wherever I actually came from," including
 * mid-navigation within a single admin section (e.g. filtered list ->
 * detail -> back to the same filtered list, not a fresh unfiltered one).
 */
export function AdminBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Nothing to go back to from the dashboard root itself.
  if (pathname === "/admin") return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className="flex h-10 w-10 items-center justify-center rounded-md text-nomad-fog transition-colors hover:bg-nomad-steel/50 hover:text-nomad-white"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
