const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'DonationRegistration';
    `;
    console.log("DonationRegistration Table Columns:");
    console.log(columns);
  } catch (e) {
    console.error("Failed to query information_schema:", e);
  }
}

check()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
