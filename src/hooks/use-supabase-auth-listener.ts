"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Listens for Supabase auth state changes (SIGNED_OUT, TOKEN_REFRESHED,
 * USER_UPDATED) and refreshes the Next.js router cache so Server Components
 * re-render with the latest session — e.g. signing out in one tab reflects
 * immediately in others without a manual reload.
 */
export function useSupabaseAuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);
}
