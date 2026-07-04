"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthenticatedUser } from "@/types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  /** True until the first client-side session check resolves. */
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refresh: async () => {},
});

/**
 * Resolves and provides the authenticated user via client-side fetch to
 * `/api/auth/me`, rather than a server-side fetch in the root layout.
 *
 * This is a deliberate architectural choice: the root layout is a Server
 * Component that renders on every route, including the fully static/ISR
 * marketing pages (home, about, contact, and later blog/gallery/events).
 * If the root layout awaited a Supabase session lookup (which reads
 * cookies()), Next.js would opt EVERY page in the app out of static
 * rendering. Instead, the navbar's auth-aware UI hydrates a moment after
 * first paint, and every public page keeps its ISR/SSG performance profile.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      setUser(data.user ?? null);
    } catch (error) {
      console.error("Failed to resolve auth session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh }}>{children}</AuthContext.Provider>
  );
}

/** Returns just the user, matching the previous simpler API used across components. */
export function useAuth(): AuthenticatedUser | null {
  return useContext(AuthContext).user;
}

/** Returns the full auth state including loading, for components that need to avoid a flash of "signed out" UI. */
export function useAuthState(): AuthContextValue {
  return useContext(AuthContext);
}
