"use client";

import { Share2, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  async function handleNativeShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — no action needed.
      }
      return;
    }
    await handleCopyLink();
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleNativeShare}
        aria-label="Share this post"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-nomad-steel text-nomad-fog transition-colors hover:border-nomad-red hover:text-nomad-red"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-nomad-steel text-nomad-fog transition-colors hover:border-nomad-red hover:text-nomad-red"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label="Copy link"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-nomad-steel text-nomad-fog transition-colors hover:border-nomad-red hover:text-nomad-red"
      >
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}
