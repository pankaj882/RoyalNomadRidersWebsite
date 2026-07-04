"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { albumSchema, type AlbumInput } from "@/lib/validations/gallery";
import { createAlbumAction, updateAlbumAction } from "@/app/admin/gallery/actions";
import type { Album } from "@/types";

interface AlbumFormProps {
  album?: Album;
}

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0]!;
}

export function AlbumForm({ album }: AlbumFormProps) {
  const router = useRouter();
  const isEditing = !!album;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AlbumInput>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: album?.title ?? "",
      description: album?.description ?? "",
      location: album?.location ?? "",
      rideDate: toDateInputValue(album?.rideDate),
      isFeatured: album?.isFeatured ?? false,
    },
  });

  const isFeatured = watch("isFeatured");

  async function onSubmit(values: AlbumInput) {
    setIsSubmitting(true);
    setFormError(null);

    const result = isEditing
      ? await updateAlbumAction(album.id, values)
      : await createAlbumAction(values);

    if (!result.success) {
      setFormError(result.error);
      setIsSubmitting(false);
      return;
    }

    toast.success(result.message ?? "Saved.");

    if (isEditing) {
      router.refresh();
      setIsSubmitting(false);
    } else if ("id" in result.data) {
      router.push(`/admin/gallery/${result.data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-red-400"
        >
          {formError}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Album Title</Label>
        <Input
          id="title"
          placeholder="Ladakh Expedition 2026"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="A short summary of this ride or trip..."
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Ladakh, India"
            aria-invalid={!!errors.location}
            {...register("location")}
          />
          {errors.location && <p className="text-xs text-red-400">{errors.location.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rideDate">Ride Date</Label>
          <Input id="rideDate" type="date" aria-invalid={!!errors.rideDate} {...register("rideDate")} />
          {errors.rideDate && <p className="text-xs text-red-400">{errors.rideDate.message}</p>}
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3 rounded-md border border-nomad-steel bg-nomad-black px-4 py-3">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setValue("isFeatured", e.target.checked)}
          className="h-4 w-4 rounded border-nomad-steel accent-nomad-red"
        />
        <span className="text-sm text-nomad-fog">Feature this album on the public gallery page</span>
      </label>

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-fit">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isEditing ? "Save Changes" : "Create Album"}
      </Button>
    </form>
  );
}
