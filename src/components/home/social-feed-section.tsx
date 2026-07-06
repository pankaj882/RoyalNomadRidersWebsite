"use client";

import { useState } from "react";
import Script from "next/script";
import { Instagram, Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { clientEnv } from "@/lib/env";
import { siteConfig } from "@/lib/constants";

/**
 * Homepage social feed, powered by LightWidget (lightwidget.com — free
 * tier: connect your Instagram account there, no login required from your
 * site's visitors, no Instagram API token or refresh-token maintenance on
 * our side).
 *
 * LightWidget embeds as a plain iframe pointing at their hosted widget page
 * (`//lightwidget.com/widgets/<WIDGET_ID>.html`), rather than a script-
 * injected div like some competitors — genuinely simpler, and there's
 * nothing to load-order against our own page's LCP. We layer in their
 * optional auto-resize script (`lightwidget.js`) so the iframe's height
 * matches its content instead of needing a fixed guess.
 *
 * Loading behavior: a centered spinner shows until the iframe's `onLoad`
 * fires (i.e. LightWidget's page itself has loaded — not necessarily every
 * image inside it, which is a reasonable approximation and avoids needing
 * any callback API from a third party we don't control).
 */
export function SocialFeedSection() {
  const widgetId = clientEnv.NEXT_PUBLIC_LIGHTWIDGET_ID;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className="bg-nomad-black py-20 sm:py-28">
      <div className="container">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <SectionHeading eyebrow="Follow The Ride" title="Life On The Road" align="center" />
          <a
            href={siteConfig.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-nomad-red hover:underline"
          >
            <Instagram className="h-4 w-4" />
            Follow on Instagram
          </a>
        </div>

        {!widgetId ? (
          <EmptyState
            icon={Instagram}
            title="Social Feed Not Connected"
            description="Create a free widget at lightwidget.com and add NEXT_PUBLIC_LIGHTWIDGET_ID to display it here."
          />
        ) : (
          <div className="relative mx-auto max-w-5xl">
            {!isLoaded && (
              <div
                className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40"
                aria-hidden="true"
              >
                <Loader2 className="h-6 w-6 animate-spin text-nomad-red" />
              </div>
            )}

            <iframe
              src={`https://lightwidget.com/widgets/${widgetId}.html`}
              scrolling="no"
              className={isLoaded ? "lightwidget-widget block w-full border-0" : "hidden"}
              style={{ overflow: "hidden" }}
              title="Instagram feed"
              onLoad={() => setIsLoaded(true)}
            />

            {/* Auto-resizes the iframe's height to fit its content — without
                this, the iframe would need a hardcoded height guess. Loaded
                after the widget itself, so it never blocks first paint. */}
            <Script src="https://cdn.lightwidget.com/widgets/lightwidget.js" strategy="lazyOnload" />
          </div>
        )}
      </div>
    </section>
  );
}
