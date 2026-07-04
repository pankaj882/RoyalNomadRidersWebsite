import { NextResponse } from "next/server";
import { getCurrentUser, canManage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRegistrationsForEvent } from "@/lib/data/admin-events";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CSV_COLUMNS = [
  "Full Name",
  "Email",
  "Phone",
  "Age",
  "Blood Group",
  "Emergency Contact Name",
  "Emergency Contact Phone",
  "Motorcycle Brand",
  "Motorcycle Model",
  "Registration Number",
  "Riding Experience",
  "Helmet",
  "Jacket",
  "Gloves",
  "Boots",
  "Knee Guards",
  "Allergies",
  "Medical Conditions",
  "Status",
  "Registered At",
] as const;

/** Escapes a value for safe inclusion in a CSV cell per RFC 4180. */
function csvCell(value: string | number | boolean | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  // A Route Handler serving a file download shouldn't redirect on auth
  // failure (there's nowhere sensible for a browser download navigation to
  // redirect to) — check the role directly and return 401/403 JSON instead
  // of using requireManagementAccess(), which is designed for page routes.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManage(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { title: true, slug: true } });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const registrations = await getRegistrationsForEvent(eventId);

  const rows = registrations.map((r) =>
    [
      r.fullName,
      r.email,
      r.phone,
      r.age,
      r.bloodGroup,
      r.emergencyContactName,
      r.emergencyContactPhone,
      r.motorcycleBrand,
      r.motorcycleModel,
      r.registrationNumber,
      r.ridingExperience,
      r.hasHelmet ? "Yes" : "No",
      r.hasJacket ? "Yes" : "No",
      r.hasGloves ? "Yes" : "No",
      r.hasBoots ? "Yes" : "No",
      r.hasKneeGuards ? "Yes" : "No",
      r.allergies ?? "",
      r.medicalConditions ?? "",
      r.status,
      formatDate(r.createdAt, { hour: "2-digit", minute: "2-digit" }),
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = [CSV_COLUMNS.join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-registrations.csv"`,
    },
  });
}
