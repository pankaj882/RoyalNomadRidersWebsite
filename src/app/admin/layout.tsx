import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut, Globe } from "lucide-react";
import { requireAdminAccess } from "@/lib/auth";
import { roleLabels, SUPER_ADMIN_ROLES, MANAGEMENT_ROLES } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/admin/notification-bell";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminBackButton } from "@/components/admin/admin-back-button";
import { Logo } from "@/components/shared/logo";
import { getInitials } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/actions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminAccess();
  const isSuperAdmin = SUPER_ADMIN_ROLES.includes(user.role);
  const isManagement = MANAGEMENT_ROLES.includes(user.role);

  return (
    <div className="flex min-h-screen flex-col bg-nomad-black lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar — hidden below the lg breakpoint, replaced by
          AdminMobileNav's Sheet menu (fixes the "no way to navigate on
          mobile" bug: previously the mobile header had no nav at all). */}
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

        <div className="flex-1 overflow-y-auto p-4">
          <AdminNav isSuperAdmin={isSuperAdmin} isManagement={isManagement} />
        </div>

        <div className="border-t border-nomad-steel p-4">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-nomad-fog transition-colors hover:bg-nomad-steel/50 hover:text-nomad-white"
          >
            <Globe className="h-4 w-4" />
            Back to Website
          </Link>
        </div>

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

      {/* Right column: a single sticky header (mobile menu trigger + logo on
          mobile, notification bell always) followed by the page content.
          This is the ONLY header rendered here — the public site's Navbar
          is suppressed on /admin routes by SiteChrome in the root layout,
          which is what fixes the "two overlapping navbars" bug. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-nomad-steel bg-nomad-charcoal/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-1 sm:gap-3">
            <AdminBackButton />
            <AdminMobileNav
              userName={user.name}
              roleLabel={roleLabels[user.role]}
              isSuperAdmin={isSuperAdmin}
              isManagement={isManagement}
            />
            <div className="lg:hidden">
              <Logo variant="mark" />
            </div>
          </div>
          <NotificationBell />
        </header>

        <main id="main-content" className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
