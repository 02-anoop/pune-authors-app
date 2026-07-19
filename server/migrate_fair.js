const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  console.log('Migrating "Fair" to "Book Fair"...');
  const result = await p.event.updateMany({
    where: { category: 'Fair' },
    data: { category: 'Book Fair' }
  });
  console.log(`Updated ${result.count} events.`);
  await p.$disconnect();
}

run().catch(e => { console.error(e); p.$disconnect(); });
