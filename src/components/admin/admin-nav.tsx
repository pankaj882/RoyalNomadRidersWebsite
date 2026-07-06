"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, Newspaper, CalendarDays, Users, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, visibility: "all" },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon, visibility: "all" },
  { label: "Blog", href: "/admin/blog", icon: Newspaper, visibility: "all" },
  { label: "Events", href: "/admin/events", icon: CalendarDays, visibility: "management" },
  { label: "Messages", href: "/admin/contact", icon: Mail, visibility: "management" },
  { label: "Users", href: "/admin/users", icon: Users, visibility: "superAdmin" },
] as const;

interface AdminNavProps {
  isSuperAdmin: boolean;
  isManagement: boolean;
  /** Called after a link is clicked — used to close the mobile Sheet on navigation. */
  onNavigate?: () => void;
  className?: string;
}

export function AdminNav({ isSuperAdmin, isManagement, onNavigate, className }: AdminNavProps) {
  const pathname = usePathname();

  const visibleNav = adminNav.filter((item) => {
    if (item.visibility === "superAdmin") return isSuperAdmin;
    if (item.visibility === "management") return isManagement;
    return true;
  });

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {visibleNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-nomad-fog transition-colors hover:bg-nomad-steel/50 hover:text-nomad-white",
              isActive && "bg-nomad-steel/60 text-nomad-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
