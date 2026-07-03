"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AuthenticatedUser } from "@/types";

const AuthContext = createContext<AuthenticatedUser | null>(null);

interface AuthProviderProps {
  user: AuthenticatedUser | null;
  children: ReactNode;
}

/**
 * Hydrates the authenticated user (resolved server-side in the root layout
 * via `getCurrentUser()`) into React context, so client components like the
 * navbar can render auth-aware UI without an extra client-side fetch or
 * layout shift while a session check resolves.
 */
export function AuthProvider({ user, children }: AuthProviderProps) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthenticatedUser | null {
  return useContext(AuthContext);
}
