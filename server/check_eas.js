const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEventAuthors() {
  const legacyEvents = await prisma.event.findMany({ where: { status: 'Legacy Archive' } });
  const legacyEventIds = legacyEvents.map(e => e.id);
  const eas = await prisma.eventAuthor.count({
    where: { eventId: { in: legacyEventIds } }
  });
  console.log(`EventAuthors mapped to Legacy Events: ${eas}`);
  await prisma.$disconnect();
}
checkEventAuthors();
