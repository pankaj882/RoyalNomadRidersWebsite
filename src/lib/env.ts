import { z } from "zod";

// -----------------------------------------------------------------------------
// Public, client-safe environment variables. Every value here is exposed to
// the browser bundle (NEXT_PUBLIC_ prefix), so nothing secret belongs here.
// For server-only secrets, see `src/lib/env.server.ts`.
// -----------------------------------------------------------------------------

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

function loadClientEnv(): ClientEnv {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  });

  if (!parsed.success) {
    console.error(
      "\u274c Invalid public environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error(
      "Invalid public environment variables. Check .env against .env.example."
    );
  }

  return parsed.data;
}

export const clientEnv = loadClientEnv();
