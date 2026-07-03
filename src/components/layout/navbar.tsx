"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { mainNavLinks } from "@/lib/constants";
import { useAuth } from "@/components/providers/auth-provider";
import { useSupabaseAuthListener } from "@/hooks/use-supabase-auth-listener";
import { logoutAction } from "@/app/(auth)/actions";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuth();

  useSupabaseAuthListener();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        isScrolled
          ? "border-b border-nomad-steel/80 bg-nomad-black/90 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-black/60 to-transparent"
      )}
    >
      <nav className="container flex h-16 items-center justify-between sm:h-20">
        <Logo />

        <ul className="hidden items-center gap-8 lg:flex">
          {mainNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative text-sm font-medium uppercase tracking-wide text-nomad-fog transition-colors hover:text-nomad-white",
                    isActive && "text-nomad-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-nomad-red" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-nomad-steel p-1 pr-3 transition-colors hover:border-nomad-ash">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-nomad-fog">{user.name.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action={logoutAction} className="w-full">
                    <button type="submit" className="flex w-full items-center gap-2 text-left text-red-400">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/events">Register For A Ride</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-nomad-steel text-nomad-fog"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-4/5 flex-col">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <ul className="mt-8 flex flex-col gap-1">
              {mainNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-md px-3 py-3 text-base font-medium uppercase tracking-wide text-nomad-fog transition-colors hover:bg-nomad-steel/40 hover:text-nomad-white",
                      pathname === link.href && "bg-nomad-steel/40 text-nomad-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3 border-t border-nomad-steel pt-6">
              {user ? (
                <>
                  <Button asChild variant="outline">
                    <Link href="/admin">Dashboard</Link>
                  </Button>
                  <form action={logoutAction}>
                    <Button type="submit" variant="ghost" className="w-full text-red-400">
                      Sign Out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/events">Register For A Ride</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
