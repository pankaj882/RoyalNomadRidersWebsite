import { Download, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { RIDING_EXPERIENCE_LABELS } from "@/lib/constants";
import type { Registration } from "@/types";

interface RegistrationsTableProps {
  eventId: string;
  registrations: Registration[];
}

const statusVariant = {
  PENDING: "secondary",
  CONFIRMED: "success",
  WAITLISTED: "warning",
  CANCELLED: "destructive",
} as const;

export function RegistrationsTable({ eventId, registrations }: RegistrationsTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-nomad-white">
          <Users className="h-5 w-5 text-nomad-red" />
          Registrations ({registrations.length})
        </h2>
        <a
          href={`/api/admin/events/${eventId}/export`}
          download
          className="flex items-center gap-2 rounded-md border border-nomad-steel px-3.5 py-2 text-sm font-medium text-nomad-fog transition-colors hover:border-nomad-red hover:text-nomad-red"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </a>
      </div>

      {registrations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-nomad-steel bg-nomad-charcoal/40 p-8 text-center text-sm text-nomad-ash">
          No one has registered for this ride yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-nomad-steel">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-nomad-charcoal text-xs uppercase tracking-wide text-nomad-ash">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Motorcycle</th>
                <th className="px-4 py-3 font-medium">Experience</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nomad-steel bg-nomad-black">
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-nomad-white">{registration.fullName}</div>
                    <div className="text-xs text-nomad-ash">
                      {registration.bloodGroup} &middot; Age {registration.age}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-nomad-ash">
                    <div>{registration.email}</div>
                    <div className="text-xs">{registration.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-nomad-ash">
                    {registration.motorcycleBrand} {registration.motorcycleModel}
                  </td>
                  <td className="px-4 py-3 text-nomad-ash">
                    {RIDING_EXPERIENCE_LABELS[registration.ridingExperience]}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[registration.status]}>{registration.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-nomad-ash">{formatDate(registration.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
