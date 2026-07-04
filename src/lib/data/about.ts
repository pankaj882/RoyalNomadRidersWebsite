import "server-only";
import { prisma } from "@/lib/prisma";

/** Core/founding team members for the About page, ordered for consistent display. */
export async function getCoreMembers() {
  const members = await prisma.user.findMany({
    where: { isFounder: true, isActive: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      founderTitle: true,
      bio: true,
      instagramHandle: true,
    },
  });

  return members;
}
