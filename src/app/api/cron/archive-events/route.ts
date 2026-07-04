import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Runs daily via the Vercel Cron Job configured in `vercel.json`
 * (`0 2 * * *` — 2am UTC). Marks any event whose start date has passed as
 * COMPLETED and archived, so the admin dashboard's "Upcoming Events" count
 * and the public archive view stay accurate without a rider ever seeing
 * this as a background process.
 *
 * Note: `getUpcomingEventsList`/`getPastEventsList` (src/lib/data/events.ts)
 * already filter on `startDate` in real time for what visitors see — this
 * job exists to keep the STORED status/isArchived flags correct for admin
 * reporting, not to gate the public-facing "is this event upcoming" logic.
 */
export async function GET(request: NextRequest) {
  const { serverEnv } = await import("@/lib/env.server");
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.event.updateMany({
      where: {
        startDate: { lt: new Date() },
        status: "UPCOMING",
      },
      data: {
        status: "COMPLETED",
        isArchived: true,
        registrationOpen: false,
      },
    });

    return NextResponse.json({ success: true, archivedCount: result.count });
  } catch (error) {
    console.error("archive-events cron failed:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
