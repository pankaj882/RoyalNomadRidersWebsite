"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminNav } from "@/components/admin/admin-nav";
import { getInitials } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/actions";

interface AdminMobileNavProps {
  userName: string;
  roleLabel: string;
  isSuperAdmin: boolean;
  isManagement: boolean;
}

export function AdminMobileNav({ userName, roleLabel, isSuperAdmin, isManagement }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open admin menu"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-nomad-steel text-nomad-fog lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[85vw] max-w-xs flex-col p-0">
        <SheetHeader className="border-b border-nomad-steel p-6">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-nomad-white">{userName}</p>
              <p className="truncate text-xs text-nomad-ash">{roleLabel}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <AdminNav
            isSuperAdmin={isSuperAdmin}
            isManagement={isManagement}
            onNavigate={() => setOpen(false)}
          />
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
      </SheetContent>
    </Sheet>
  );
}
