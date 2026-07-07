import { MapPin } from "lucide-react";
import { clientEnv } from "@/lib/env";

export function MapEmbed() {
  const embedUrl = clientEnv.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

  if (!embedUrl) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 p-8 text-center">
        <MapPin className="h-8 w-8 text-nomad-gold" aria-hidden="true" />
        <p className="text-sm text-nomad-ash">
          Map not configured yet. Add <code className="text-nomad-fog">NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL</code> in
          your environment variables to display the club&apos;s meeting point here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[320px] w-full overflow-hidden rounded-lg border border-nomad-steel">
      <iframe
        src={embedUrl}
        title="Royal Nomad Riders Club meeting point"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full min-h-[320px] border-0"
        allowFullScreen
      />
    </div>
  );
}
