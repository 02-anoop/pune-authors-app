const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting raw ALTER TABLE query...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "DonationRegistration" ADD COLUMN IF NOT EXISTS "isManual" BOOLEAN DEFAULT false;
    `);
    console.log("Raw ALTER TABLE query completed successfully!");

    // Double check the columns now
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'DonationRegistration';
    `;
    console.log("Current columns:", columns.map(c => c.column_name));
  } catch (e) {
    console.error("Raw query failed:", e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
