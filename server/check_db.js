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
  for(let ev of gEvents) {
    console.log(`GalleryEvent: ${ev.location} @ ${ev.place}, Date: ${ev.date}`);
  }
}

main().finally(() => prisma.$disconnect());

