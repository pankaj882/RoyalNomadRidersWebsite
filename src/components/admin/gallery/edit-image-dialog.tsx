"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { imageEditSchema, type ImageEditInput } from "@/lib/validations/gallery";
import { updateImageAction } from "@/app/admin/gallery/actions";
import type { GalleryImage } from "@/types";

interface EditImageDialogProps {
  image: GalleryImage;
}

export function EditImageDialog({ image }: EditImageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ImageEditInput>({
    resolver: zodResolver(imageEditSchema),
    defaultValues: {
      imageId: image.id,
      caption: image.caption ?? "",
      altText: image.altText,
    },
  });

  async function onSubmit(values: ImageEditInput) {
    setIsSubmitting(true);
    const result = await updateImageAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Photo updated.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Edit caption"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Photo</DialogTitle>
          <DialogDescription>Update the caption and alt text for this photo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <input type="hidden" {...register("imageId")} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" placeholder="Crossing the Khardung La pass" {...register("caption")} />
            {errors.caption && <p className="text-xs text-red-400">{errors.caption.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="altText">Alt Text (accessibility & SEO)</Label>
            <Input
              id="altText"
              placeholder="Riders crossing a snow-covered mountain pass"
              aria-invalid={!!errors.altText}
              {...register("altText")}
            />
            {errors.altText && <p className="text-xs text-red-400">{errors.altText.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
