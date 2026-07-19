const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const schemas = await prisma.$queryRaw`
      SELECT nspname AS schema_name
      FROM pg_catalog.pg_namespace
      WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';
    `;
    console.log("All schemas in database:", schemas.map(s => s.schema_name));

    const tables = await prisma.$queryRaw`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT LIKE 'pg_%' AND table_schema != 'information_schema'
      ORDER BY table_schema, table_name;
    `;
    console.log("\nAll tables in database across schemas:");
    console.table(tables);
  } catch (e) {
    console.error("Failed to query pg_catalog:", e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
