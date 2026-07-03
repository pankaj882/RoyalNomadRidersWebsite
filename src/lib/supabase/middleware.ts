import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Refreshes the Supabase auth session cookie on every matched request.
 * Must run before any Server Component reads the session, otherwise users
 * get intermittently logged out when their access token expires mid-visit.
 *
 * Returns both the (possibly redirected) response and the resolved user,
 * so `src/middleware.ts` can make route-protection decisions without a
 * second round-trip to Supabase.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: never remove this call. It refreshes an expired token and
  // must run before any other Supabase call in this request lifecycle.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
