const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const dbs = await prisma.$queryRaw`
      SELECT datname FROM pg_database WHERE datistemplate = false;
    `;
    console.log("Databases on PostgreSQL server:");
    console.log(dbs.map(d => d.datname));
  } catch (e) {
    console.error("Failed to query pg_database:", e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
