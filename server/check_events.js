const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.event.findMany({ select: { id: true, name: true, eventType: true, category: true }, orderBy: { id: 'asc' } })
  .then(r => {
    console.log(`Total events: ${r.length}`);
    r.forEach(e => console.log(`[${e.id}] "${e.name}" | Format: ${e.eventType} | Category: ${e.category}`));
  })
  .finally(() => p.$disconnect());
