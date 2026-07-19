const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const gEvents = await prisma.galleryEvent.findMany({
    where: {
      OR: [
        { location: { contains: "Airport" } },
        { place: { contains: "Airport" } }
      ]
    }
  });

  console.log(`Found ${gEvents.length} GalleryEvents for Airport.`);
  for (const event of gEvents) {
    if (event.date) {
      let d = new Date(event.date);
      let oldYear = d.getFullYear();
      if (oldYear === 2026) {
        d.setFullYear(2025);
        await prisma.galleryEvent.update({
          where: { id: event.id },
          data: { date: d }
        });
        console.log(`Updated ${event.location}: 2026 -> 2025`);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

