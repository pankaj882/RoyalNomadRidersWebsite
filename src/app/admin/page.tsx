import type { Metadata } from "next";
import Link from "next/link";
import {
  Image as ImageIcon,
  Newspaper,
  CalendarDays,
  ClipboardList,
  FileEdit,
  Clock,
  Users,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdminAccess } from "@/lib/auth";
import {
  getDashboardStats,
  getRecentRegistrations,
  getRecentBlogsAdmin,
  getUpcomingEventsAdmin,
} from "@/lib/data/admin-dashboard";
import { formatNumber, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };

const registrationStatusVariant = {
  PENDING: "secondary",
  CONFIRMED: "success",
  WAITLISTED: "warning",
  CANCELLED: "destructive",
} as const;

const blogStatusVariant = {
  DRAFT: "secondary",
  PUBLISHED: "success",
  ARCHIVED: "outline",
} as const;

export default async function AdminDashboardPage() {
  const user = await requireAdminAccess();

  const [stats, recentRegistrations, recentBlogs, upcomingEvents] = await Promise.all([
    getDashboardStats(),
    getRecentRegistrations(6),
    getRecentBlogsAdmin(6),
    getUpcomingEventsAdmin(5),
  ]);

  const statCards = [
    { label: "Gallery Images", value: stats.galleryImageCount, icon: ImageIcon, href: "/admin/gallery" },
    { label: "Published Blogs", value: stats.publishedBlogCount, icon: Newspaper, href: "/admin/blog" },
    { label: "Upcoming Events", value: stats.upcomingEventCount, icon: CalendarDays, href: "/admin/events" },
    { label: "Total Registrations", value: stats.totalRegistrations, icon: ClipboardList, href: "/admin/events" },
    { label: "Draft Blogs", value: stats.draftBlogCount, icon: FileEdit, href: "/admin/blog" },
    { label: "Waitlisted Riders", value: stats.waitlistedRegistrations, icon: Clock, href: "/admin/events" },
    { label: "Active Users", value: stats.activeUserCount, icon: Users, href: "/admin/users" },
    { label: "New Messages", value: stats.newContactCount, icon: Mail, href: "/admin/contact" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-nomad-white">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-nomad-ash">Here&apos;s what&apos;s happening across the club right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-colors hover:border-nomad-ash">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-nomad-ash">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-nomad-red" />
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-bold text-nomad-white">{formatNumber(stat.value)}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Registrations</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/events">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-nomad-ash">No registrations yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentRegistrations.map((registration) => (
                  <Link
                    key={registration.id}
                    href={`/admin/events/${registration.event.id}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-nomad-steel bg-nomad-black p-3 transition-colors hover:border-nomad-ash"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-nomad-white">{registration.fullName}</p>
                      <p className="truncate text-xs text-nomad-ash">{registration.event.title}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={registrationStatusVariant[registration.status]}>
                        {registration.status}
                      </Badge>
                      <span className="text-[0.65rem] text-nomad-ash">{formatDate(registration.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/events">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-nomad-ash">No upcoming rides scheduled.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="flex flex-col gap-1 rounded-md border border-nomad-steel bg-nomad-black p-3 transition-colors hover:border-nomad-ash"
                  >
                    <p className="truncate text-sm font-medium text-nomad-white">{event.title}</p>
                    <div className="flex items-center justify-between text-xs text-nomad-ash">
                      <span>{formatDate(event.startDate)}</span>
                      <span>{event.seatsRemaining} seats left</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Blog Activity</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/blog">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBlogs.length === 0 ? (
            <p className="text-sm text-nomad-ash">No posts yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-nomad-steel">
              {recentBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/admin/blog/${blog.id}`}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-nomad-red"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-nomad-white">{blog.title}</p>
                    <p className="text-xs text-nomad-ash">
                      {blog.author.name} &middot; {formatDate(blog.updatedAt)}
                    </p>
                  </div>
                  <Badge variant={blogStatusVariant[blog.status]}>{blog.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
