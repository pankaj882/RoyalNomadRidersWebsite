"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Wraps next/image and unmounts itself on load failure instead of leaving
 * the browser's default broken-image icon + visible alt text overlay.
 *
 * Use this for any full-bleed hero/banner image where the container behind
 * it already has a solid background or gradient (bg-nomad-black, etc.) —
 * if the photo fails to load (dead hotlink, blocked domain, deleted
 * Storage object), the section still looks intentional instead of broken.
 */
export function FallbackImage(props: ImageProps) {
  const [hasErrored, setHasErrored] = useState(false);

  if (hasErrored) return null;

  return <Image {...props} onError={() => setHasErrored(true)} />;
}
