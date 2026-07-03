import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Must be created fresh per-request (never module-level cached)
 * because it binds to the current request's cookie jar.
 *
 * NOTE: Calling `cookies().set()` from a Server Component (not an Action or
 * Route Handler) throws. The try/catch below is intentional — when called
 * from a Server Component, session refresh is instead handled by
 * `src/middleware.ts`, which can write response cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // Called from a Server Component — safe to ignore, middleware
            // handles session refresh on the response.
          }
        },
      },
    }
  );
}

/**
 * Admin-privileged Supabase client using the service role key. Bypasses
 * Row Level Security — use ONLY in trusted server-side admin operations
 * (bulk gallery upload, CSV export, role management). Never expose to the
 * client or use in a user-scoped request path.
 */
export async function createAdminClient() {
  const { serverEnv } = await import("@/lib/env.server");
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");

  return createSupabaseClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
