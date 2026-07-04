import "server-only";
import { headers } from "next/headers";

/**
 * Resolves the client IP from proxy headers. Vercel populates `x-forwarded-for`
 * for every request; falls back to a static bucket key when unavailable (e.g.
 * local dev), so rate limiting still functions rather than throwing.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }

  const realIp = headerList.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
