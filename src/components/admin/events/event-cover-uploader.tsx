"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { uploadEventCoverImage, ACCEPTED_EVENT_IMAGE_TYPES, MAX_EVENT_IMAGE_SIZE_BYTES } from "@/lib/event-upload";

interface EventCoverUploaderProps {
  value: string;
  onChange: (url: string) => void;
  draftId: string;
}

export function EventCoverUploader({ value, onChange, draftId }: EventCoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_EVENT_IMAGE_TYPES.includes(file.type)) {
      toast.error("Unsupported image type. Use JPEG, PNG, WebP, or AVIF.");
      return;
    }
    if (file.size > MAX_EVENT_IMAGE_SIZE_BYTES) {
      toast.error("Image is too large. Maximum size is 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadEventCoverImage(file, draftId);
      onChange(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-nomad-steel bg-nomad-steel">
          <Image src={value} alt="Cover image preview" fill sizes="640px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove cover image"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-nomad-steel bg-nomad-charcoal/40 text-nomad-ash transition-colors hover:border-nomad-red hover:text-nomad-red disabled:pointer-events-none disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          <span className="text-sm font-medium">{isUploading ? "Uploading..." : "Upload Cover Image"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EVENT_IMAGE_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
