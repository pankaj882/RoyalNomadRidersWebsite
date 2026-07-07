"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateContactStatusAction } from "@/app/admin/contact/actions";
import { formatDate } from "@/lib/utils";
import type { Contact, ContactStatus } from "@/types";

const STATUS_OPTIONS: ContactStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"];

const statusVariant = {
  NEW: "destructive",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  ARCHIVED: "outline",
} as const;

export function ContactRow({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleStatusChange(status: string) {
    const result = await updateContactStatusAction(contact.id, status);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Status updated.");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col gap-2 rounded-lg border border-nomad-steel bg-nomad-charcoal p-4 text-left transition-colors hover:border-nomad-ash sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-nomad-white">{contact.name}</p>
            <Badge variant={statusVariant[contact.status]}>{contact.status.replace("_", " ")}</Badge>
          </div>
          <p className="truncate text-sm text-nomad-ash">{contact.subject}</p>
        </div>
        <span className="shrink-0 text-xs text-nomad-ash">{formatDate(contact.createdAt)}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{contact.subject}</DialogTitle>
            <DialogDescription>From {contact.name}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-nomad-ash">
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-nomad-gold">
                <Mail className="h-3.5 w-3.5" /> {contact.email}
              </a>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-nomad-gold">
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </a>
              )}
            </div>

            <p className="whitespace-pre-line rounded-md border border-nomad-steel bg-nomad-black p-4 text-sm text-nomad-fog">
              {contact.message}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-nomad-ash">Status</span>
              <Select value={contact.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
