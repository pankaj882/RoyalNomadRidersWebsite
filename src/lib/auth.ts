import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES, MANAGEMENT_ROLES, SUPER_ADMIN_ROLES } from "@/lib/constants";
import type { AuthenticatedUser, Role } from "@/types";

/**
 * Resolves the current Supabase session into an application user profile
 * (with role) from Prisma. Wrapped in React's `cache()` so multiple calls
 * within the same request (layout + page + nested components) only hit the
 * database once.
 */
export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  const profile = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { id: true, email: true, name: true, avatarUrl: true, role: true, isActive: true },
  });

  if (!profile || !profile.isActive) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
  };
});

/** Redirects to /login (preserving the intended destination) if unauthenticated. */
export async function requireUser(redirectTo = "/admin"): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

/** Redirects to /login or / (403) unless the user holds one of `allowedRoles`. */
export async function requireRole(allowedRoles: Role[], redirectTo = "/admin"): Promise<AuthenticatedUser> {
  const user = await requireUser(redirectTo);
  if (!allowedRoles.includes(user.role)) {
    redirect("/?error=unauthorized");
  }
  return user;
}

/** Any authenticated staff member (Super Admin, Admin, or Blog Author). */
export async function requireAdminAccess(): Promise<AuthenticatedUser> {
  return requireRole(ADMIN_ROLES);
}

/** Full management access — gallery, events, registrations (not user roles). */
export async function requireManagementAccess(): Promise<AuthenticatedUser> {
  return requireRole(MANAGEMENT_ROLES);
}

/** Super Admin only — user role management, destructive/global settings. */
export async function requireSuperAdmin(): Promise<AuthenticatedUser> {
  return requireRole(SUPER_ADMIN_ROLES);
}

/** Non-redirecting boolean checks, useful for conditionally rendering UI. */
export function hasRole(user: AuthenticatedUser | null, roles: Role[]): boolean {
  return !!user && roles.includes(user.role);
}

export function isAdmin(user: AuthenticatedUser | null): boolean {
  return hasRole(user, ADMIN_ROLES);
}

export function canManage(user: AuthenticatedUser | null): boolean {
  return hasRole(user, MANAGEMENT_ROLES);
}
