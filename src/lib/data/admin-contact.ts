import "server-only";
import { prisma } from "@/lib/prisma";
import type { ContactStatus } from "@prisma/client";

export interface ContactListFilters {
  status?: ContactStatus;
}

export async function getAllContactSubmissions(filters: ContactListFilters = {}) {
  return prisma.contact.findMany({
    where: filters.status ? { status: filters.status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}
