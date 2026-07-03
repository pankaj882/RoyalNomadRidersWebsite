"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches. Prefer Tailwind
 * responsive classes for layout; reach for this only when a breakpoint
 * decision must happen in JS (e.g. disabling a Framer Motion effect on
 * mobile for performance).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", listener);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
