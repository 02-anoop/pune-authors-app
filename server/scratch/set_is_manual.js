const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.donationRegistration.updateMany({
    data: { isManual: true }
  });
  console.log(`Updated ${result.count} registrations to isManual: true`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
