import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Image as ImageIcon, Newspaper, CalendarDays, Users, LogOut } from "lucide-react";
import { requireAdminAccess } from "@/lib/auth";
import { roleLabels } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/actions";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Users", href: "/admin/users", icon: Users },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminAccess();

  return (
    <div className="grid min-h-screen grid-cols-1 bg-nomad-black lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-nomad-steel bg-nomad-charcoal lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-nomad-steel px-6 py-6">
          <Avatar>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-nomad-white">{user.name}</p>
            <p className="truncate text-xs text-nomad-ash">{roleLabels[user.role]}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-nomad-fog transition-colors hover:bg-nomad-steel/50 hover:text-nomad-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className="border-t border-nomad-steel p-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-nomad-steel bg-nomad-charcoal px-6 py-4 lg:hidden">
          <p className="font-display text-lg text-nomad-white">Admin</p>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-red-400">
              Sign Out
            </button>
          </form>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
