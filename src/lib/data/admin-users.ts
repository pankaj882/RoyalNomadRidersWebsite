import "server-only";
import { prisma } from "@/lib/prisma";

/** All users for the admin Users page, newest first. */
export async function getAllUsersAdmin() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { blogs: true, registrations: true },
      },
    },
  });
}
