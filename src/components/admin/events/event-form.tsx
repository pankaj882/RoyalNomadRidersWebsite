"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCoverUploader } from "@/components/admin/events/event-cover-uploader";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { createEventAction, updateEventAction } from "@/app/admin/events/actions";
import { DIFFICULTY_LABELS } from "@/lib/constants";
import type { Event } from "@/types";

interface EventFormProps {
  event?: Event;
}

function toDateTimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEditing = !!event;
  const draftId = useMemo(() => event?.id ?? crypto.randomUUID(), [event?.id]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      coverImageUrl: event?.coverImageUrl ?? "",
      destination: event?.destination ?? "",
      meetingPoint: event?.meetingPoint ?? "",
      startDate: toDateTimeLocal(event?.startDate),
      endDate: toDateTimeLocal(event?.endDate),
      meetingTime: event?.meetingTime ?? "",
      difficulty: event?.difficulty ?? "MODERATE",
      distanceKm: event?.distanceKm ?? undefined,
      rideCaptainName: event?.rideCaptainName ?? "",
      rideCaptainPhone: event?.rideCaptainPhone ?? "",
      maxSeats: event?.maxSeats ?? undefined,
      registrationOpen: event?.registrationOpen ?? true,
    },
  });

  const coverImageUrl = watch("coverImageUrl");
  const difficulty = watch("difficulty");
  const registrationOpen = watch("registrationOpen");

  async function onSubmit(values: EventInput) {
    setIsSubmitting(true);
    setFormError(null);

    const result = isEditing
      ? await updateEventAction(event.id, values)
      : await createEventAction(values);

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    toast.success(result.message ?? "Saved.");

    if (isEditing) {
      router.refresh();
    } else if ("id" in result.data) {
      router.push(`/admin/events/${result.data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
      {formError && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-red-400">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Ride Title</Label>
            <Input id="title" placeholder="Ladakh Expedition 2026" aria-invalid={!!errors.title} {...register("title")} />
            {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={6} aria-invalid={!!errors.description} {...register("description")} />
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" placeholder="Ladakh, India" aria-invalid={!!errors.destination} {...register("destination")} />
              {errors.destination && <p className="text-xs text-red-400">{errors.destination.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meetingPoint">Meeting Point</Label>
              <Input id="meetingPoint" placeholder="City Fuel Station, MG Road" aria-invalid={!!errors.meetingPoint} {...register("meetingPoint")} />
              {errors.meetingPoint && <p className="text-xs text-red-400">{errors.meetingPoint.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Start Date &amp; Time</Label>
              <Input id="startDate" type="datetime-local" aria-invalid={!!errors.startDate} {...register("startDate")} />
              {errors.startDate && <p className="text-xs text-red-400">{errors.startDate.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">End Date &amp; Time (optional)</Label>
              <Input id="endDate" type="datetime-local" aria-invalid={!!errors.endDate} {...register("endDate")} />
              {errors.endDate && <p className="text-xs text-red-400">{errors.endDate.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meetingTime">Meeting Time</Label>
              <Input id="meetingTime" placeholder="6:00 AM" aria-invalid={!!errors.meetingTime} {...register("meetingTime")} />
              {errors.meetingTime && <p className="text-xs text-red-400">{errors.meetingTime.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="distanceKm">Distance (km)</Label>
              <Input id="distanceKm" type="number" min={1} aria-invalid={!!errors.distanceKm} {...register("distanceKm")} />
              {errors.distanceKm && <p className="text-xs text-red-400">{errors.distanceKm.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label>Cover Image</Label>
            <EventCoverUploader
              value={coverImageUrl}
              onChange={(url) => setValue("coverImageUrl", url, { shouldValidate: true })}
              draftId={draftId}
            />
            {errors.coverImageUrl && <p className="text-xs text-red-400">{errors.coverImageUrl.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setValue("difficulty", v as EventInput["difficulty"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rideCaptainName">Ride Captain</Label>
            <Input id="rideCaptainName" aria-invalid={!!errors.rideCaptainName} {...register("rideCaptainName")} />
            {errors.rideCaptainName && <p className="text-xs text-red-400">{errors.rideCaptainName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rideCaptainPhone">Ride Captain Phone (optional)</Label>
            <Input id="rideCaptainPhone" type="tel" {...register("rideCaptainPhone")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maxSeats">Max Seats</Label>
            <Input id="maxSeats" type="number" min={1} aria-invalid={!!errors.maxSeats} {...register("maxSeats")} />
            {errors.maxSeats && <p className="text-xs text-red-400">{errors.maxSeats.message}</p>}
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-3 rounded-md border border-nomad-steel bg-nomad-black px-4 py-3">
            <input
              type="checkbox"
              checked={registrationOpen}
              onChange={(e) => setValue("registrationOpen", e.target.checked)}
              className="h-4 w-4 rounded border-nomad-steel accent-nomad-red"
            />
            <span className="text-sm text-nomad-fog">Registration open</span>
          </label>
        </div>
      </div>

      <div className="border-t border-nomad-steel pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditing ? "Save Changes" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
