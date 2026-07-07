"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star, ImagePlus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { founderDisplaySchema, type FounderDisplayInput } from "@/lib/validations/user";
import { updateFounderDisplayAction } from "@/app/admin/users/actions";
import { uploadUserAvatar, ACCEPTED_AVATAR_TYPES, MAX_AVATAR_SIZE_BYTES } from "@/lib/user-upload";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

interface FounderDisplayDialogProps {
  user: User;
}

export function FounderDisplayDialog({ user }: FounderDisplayDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FounderDisplayInput>({
    resolver: zodResolver(founderDisplaySchema),
    defaultValues: {
      isFounder: user.isFounder,
      founderTitle: user.founderTitle ?? "",
      displayOrder: user.displayOrder,
      avatarUrl: user.avatarUrl ?? "",
      bio: user.bio ?? "",
      instagramHandle: user.instagramHandle ?? "",
    },
  });

  const isFounder = watch("isFounder");
  const avatarUrl = watch("avatarUrl");

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Unsupported image type. Use JPEG, PNG, WebP, or AVIF.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Image is too large. Maximum size is 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const url = await uploadUserAvatar(file, user.id);
      setValue("avatarUrl", url, { shouldValidate: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function onSubmit(values: FounderDisplayInput) {
    setIsSubmitting(true);
    const result = await updateFounderDisplayAction(user.id, values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(result.message ?? "Updated.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Edit About page display">
          <Star className={user.isFounder ? "h-3.5 w-3.5 fill-nomad-gold text-nomad-gold" : "h-3.5 w-3.5"} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About Page Display</DialogTitle>
          <DialogDescription>
            Feature {user.name} on the public About page&apos;s Core Members section.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-nomad-steel bg-nomad-charcoal px-4 py-3">
            <Checkbox
              checked={isFounder}
              onCheckedChange={(checked) => setValue("isFounder", checked === true)}
            />
            <span className="text-sm text-nomad-fog">Show on About page as a core member</span>
          </label>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-nomad-steel">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingPhoto}
                onClick={() => inputRef.current?.click()}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" />
                )}
                {avatarUrl ? "Change Photo" : "Upload Photo"}
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_AVATAR_TYPES.join(",")}
                onChange={handlePhotoChange}
                className="hidden"
              />
              {errors.avatarUrl && <p className="text-xs text-red-400">{errors.avatarUrl.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="founderTitle">Title / Designation</Label>
            <Input id="founderTitle" placeholder="Ride Captain" {...register("founderTitle")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Short Description</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="A short line about this member for the About page card..."
              {...register("bio")}
            />
            {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instagramHandle">Instagram Username</Label>
            <Input id="instagramHandle" placeholder="johnrides (without @)" {...register("instagramHandle")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input id="displayOrder" type="number" min={0} {...register("displayOrder")} />
            {errors.displayOrder && <p className="text-xs text-red-400">{errors.displayOrder.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isUploadingPhoto}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
