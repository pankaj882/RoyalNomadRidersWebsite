"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings, Lock, Unlock, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toggleRegistrationOpenAction, cancelEventAction, deleteEventAction } from "@/app/admin/events/actions";

interface EventRowActionsProps {
  eventId: string;
  registrationOpen: boolean;
  status: string;
}

export function EventRowActions({ eventId, registrationOpen, status }: EventRowActionsProps) {
  const router = useRouter();

  async function handleToggleRegistration() {
    const result = await toggleRegistrationOpenAction(eventId, !registrationOpen);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Updated.");
    router.refresh();
  }

  async function handleCancel() {
    const result = await cancelEventAction(eventId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Event cancelled.");
    router.refresh();
  }

  async function handleDelete() {
    const result = await deleteEventAction(eventId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Event deleted.");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/events/${eventId}`}>
          <Settings className="h-3.5 w-3.5" />
          Manage
        </Link>
      </Button>
      <Button size="sm" variant="ghost" onClick={handleToggleRegistration} aria-label="Toggle registration">
        {registrationOpen ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
      </Button>
      {status !== "CANCELLED" && (
        <ConfirmDialog
          trigger={
            <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300" aria-label="Cancel event">
              <Ban className="h-3.5 w-3.5" />
            </Button>
          }
          title="Cancel this ride?"
          description="Registered riders will see this ride marked as cancelled. This does not delete existing registrations."
          confirmLabel="Cancel Ride"
          variant="default"
          onConfirm={handleCancel}
        />
      )}
      <ConfirmDialog
        trigger={
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" aria-label="Delete event">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
        title="Delete this event?"
        description="This permanently deletes the event and all of its registrations. This cannot be undone."
        confirmLabel="Delete Event"
        onConfirm={handleDelete}
      />
    </div>
  );
}
