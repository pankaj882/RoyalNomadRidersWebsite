"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this should also report to an error-tracking service
    // (e.g. Sentry) — wired up when the project moves past the free tier.
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-nomad-gold/40 bg-nomad-gold/10">
        <AlertTriangle className="h-8 w-8 text-nomad-gold" aria-hidden="true" />
      </span>
      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">Something Went Wrong</h1>
        <p className="mt-2 max-w-md text-sm text-nomad-ash">
          The engine stalled on that one. Try restarting the page — if it keeps happening, let us
          know through the contact page.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back Home</Link>
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-nomad-ash/60">Error reference: {error.digest}</p>
      )}
    </div>
  );
}
