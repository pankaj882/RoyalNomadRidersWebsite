"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { founderDisplaySchema, type FounderDisplayInput } from "@/lib/validations/user";
import { updateFounderDisplayAction } from "@/app/admin/users/actions";
import type { User } from "@/types";

interface FounderDisplayDialogProps {
  user: User;
}

export function FounderDisplayDialog({ user }: FounderDisplayDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  const isFounder = watch("isFounder");

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
          <Star className={user.isFounder ? "h-3.5 w-3.5 fill-nomad-red text-nomad-red" : "h-3.5 w-3.5"} />
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="founderTitle">Title / Role</Label>
            <Input id="founderTitle" placeholder="Ride Captain" {...register("founderTitle")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input id="displayOrder" type="number" min={0} {...register("displayOrder")} />
            {errors.displayOrder && <p className="text-xs text-red-400">{errors.displayOrder.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
