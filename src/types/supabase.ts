// -----------------------------------------------------------------------------
// This project uses Prisma as the ORM of record for all application data
// (see prisma/schema.prisma). The Supabase JS client is used only for:
//   1. Supabase Auth (sign up / sign in / session management)
//   2. Supabase Storage (gallery image uploads)
// so the `Database` generic below intentionally stays minimal rather than
// mirroring every Prisma table. If you later query Postgres directly through
// supabase-js (bypassing Prisma) for a specific edge case, regenerate this
// file with the Supabase CLI instead of hand-editing it:
//
//   npx supabase gen types typescript --project-id <project-ref> > src/types/supabase.ts
// -----------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          public: boolean | null;
        };
      };
    };
  };
}
