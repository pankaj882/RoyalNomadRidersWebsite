import { PrismaClient } from "@prisma/client";

// -----------------------------------------------------------------------------
// Prisma client singleton.
// In serverless/edge environments (Vercel) and in Next.js dev mode with fast
// refresh, importing `new PrismaClient()` in every module would exhaust the
// Postgres connection pool. We cache the instance on `globalThis` so hot
// reloads and repeated route invocations reuse the same client.
// -----------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export default prisma;
