import type { Metadata } from "next";
import { Image as ImageIcon, Newspaper, CalendarDays, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const user = await requireAdminAccess();

  const [galleryCount, blogCount, upcomingEventCount, registrationCount] = await Promise.all([
    prisma.galleryImage.count(),
    prisma.blog.count({ where: { status: "PUBLISHED" } }),
    prisma.event.count({ where: { status: "UPCOMING", isArchived: false } }),
    prisma.registration.count(),
  ]);

  const stats = [
    { label: "Gallery Images", value: galleryCount, icon: ImageIcon },
    { label: "Published Blogs", value: blogCount, icon: Newspaper },
    { label: "Upcoming Events", value: upcomingEventCount, icon: CalendarDays },
    { label: "Total Registrations", value: registrationCount, icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-nomad-ash">
          Here&apos;s what&apos;s happening across the club right now.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-nomad-ash">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-nomad-red" />
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-bold text-nomad-white">
                  {formatNumber(stat.value)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 1 Foundation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-nomad-ash">
          Gallery, Blog, Event, and User management screens are built in their dedicated phases.
          This dashboard already reads live counts from the database via Prisma, so the numbers
          above will update automatically as content is added in later phases.
        </CardContent>
      </Card>
    </div>
  );
}
