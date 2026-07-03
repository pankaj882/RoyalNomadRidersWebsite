import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Mountain Rides", slug: "mountain-rides", description: "Himalayan and high-altitude touring reports." },
  { name: "Off-Road", slug: "off-road", description: "Trail riding, dirt tracks, and technical terrain." },
  { name: "Coastal Rides", slug: "coastal-rides", description: "Highway and coastal long-distance runs." },
  { name: "Camping & Bikepacking", slug: "camping-bikepacking", description: "Overnight rides and campsite stories." },
  { name: "Gear & Maintenance", slug: "gear-maintenance", description: "Riding gear reviews and motorcycle upkeep." },
  { name: "Club News", slug: "club-news", description: "Announcements and club milestones." },
] as const;

async function main() {
  console.log("Seeding blog categories...");

  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: { description: category.description },
    });
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
  console.log("");
  console.log("NOTE: To create your first Super Admin:");
  console.log("  1. Register a normal account at /register (or via Supabase Dashboard -> Authentication).");
  console.log("  2. Run: UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'you@example.com';");
  console.log("     (via Supabase SQL Editor, or `npx prisma studio`).");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
